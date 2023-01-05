// const hre = require("hardhat");
const { ethers } = require("hardhat");

/* todo:
    1) подключить ещё 2 api эндпойнта 
    2) смотреть позиции токенов с блокчейна
    3) упорядочивать в соответствии с получаемыми результатами
    4) округлять по-умному (различать 100 и 10.567)
    5) "причесать контракт": сделать онлиовнера и тест

    *) сделать подтверждение через телегу
*/
var addressToApy = new Map();
var positionToAddress = new Map();

var yearnTokens = [
    "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", //WFTM
    "0x82f0B8B456c1A451378467398982d4834b6829c1", //MIM
    "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", //USDC
    "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", //DAI
    "0x29b0Da86e484E1C0029B56e817912d778aC0EC69", //YFI
    "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355", //FRAX
    "0x049d68029688eAbF473097a2fC38ef61633A3C7A", //fUSDT
    "0xD02a30d33153877BC20e5721ee53DeDEE0422B2F", //g3CRV
    "0x58e57cA18B7A47112b877E31929798Cd3D703b0f", //crv3crypto
    "0x1E4F97b9f9F913c46F1632781732927B9019C68b", //CRV
    "0x74b23882a30290451A17c44f4F05243b6b58C76d", //ETH
    "0x321162Cd933E2Be498Cd2267a90534A804051b11", //BTC
    "0x468003B688943977e6130F4F68F23aad939a1040", //SPELL
    "0x3129662808bEC728a27Ab6a6b9AFd3cBacA8A43c", //DOLA
    "0x511D35c52a3C244E7b8bd92c0C297755FbD89212", //AVAX
    "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8", //LINK
    "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE", //BOO
    "0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1", //fBEETS
    "0x2dd7C9371965472E5A5fD28fbE165007c61439E1", //3poolV2-f
];

async function fetchYearnApy() {
    let url = `https://api.yearn.finance/v1/chains/250/vaults/all`;
    let response = await fetch(url, {});
    let data = await response.json();

    let addresses = [];
    let apy = [];

    for (let i = 0; i < data.length; i++) {
        addresses.push(data[i].token.address);

        // convert to percentage and leave only 2 decimals
        apy.push((data[i].apy.net_apy * 100).toFixed(2));
        addressToApy.set(
            data[i].token.address,
            (data[i].apy.net_apy * 100).toFixed(2)
        );
    }
    return apy;
}

// for hardcoded tokenlist get apy from map
// returns apy array sorted like the hardcoded tokenlist
function getApy(tokenList) {
    let apyArray = [];
    for (token in tokenList) {
        let apy = addressToApy.get(tokenList[token]);
        apyArray.push(apy);
    }
    console.log(apyArray);
    return apyArray;
}

// takes apy array and converts to desired Hex
    // float -> binary(mantissa + integer) -> hex(binary)
// returns hex array sorted like hardcoded tokenlist
async function floatToFormatedHex(inputFloatNumbers) {
    // receive normal float numbers
    // convert them to appropriate format e.g. xxx.xxx
    // max number is 16383
    // min number is 0 (0.001)

    // convert inputFloatNumbers to double binary
    let doubleNumbers = [];
    let binaryOutput = [];
    for (number in inputFloatNumbers) {
        // split float number into integer and decimal parts
        let integerPart = inputFloatNumbers[number].split(".")[0];
        let decimalPart = inputFloatNumbers[number].split(".")[1];
        if (decimalPart == undefined) {
            decimalPart = "";
        }

        // concatenate 2 numbers to remove dot
        let finalNumber = integerPart + decimalPart;

        // calculate mantissa and add leading 0 if mantissa equals 0 or 1
        let mantissa = decimalPart.length;
        let mantissaToBinary = mantissa.toString(2);
        if (mantissaToBinary.length == 1) {
            mantissaToBinary = "0" + mantissaToBinary;
        }
        // convert concatenated number to binary
        let decToBinary = parseInt(finalNumber).toString(2);

        // TODO: change this mechanic in some way (by reducing precision?)

        // check if number is > 16383
            //  if true put 16383
        if (mantissaToBinary.length + decToBinary.length > 16) {
            console.log("FAIL! \nconverting this number to max int14");
            decToBinary = parseInt("16383").toString(2);
        }

        // append zeros after mantissa if binary length < 16
        if (mantissaToBinary.length + decToBinary.length < 16) {
            let diff = 16 - mantissaToBinary.length - decToBinary.length;
            console.log("lacking zeros: ", diff);
            mantissaToBinary = mantissaToBinary + "0".repeat(diff);
            console.log(mantissaToBinary);
        }

        let encodedBinary = mantissaToBinary + decToBinary;

        console.log("binary result: ", encodedBinary);
        binaryOutput.push(encodedBinary);

        // convert result to hex
        let binToHex = parseInt(encodedBinary, 2).toString(16);

        // if hex number is smaller then 4 digits
        // append zeros
        if (binToHex.length < 4) {
            binToHex = "0".repeat(4 - binToHex.length) + binToHex;
        }
        doubleNumbers.push(binToHex);
    }

    console.log("binary: ", binaryOutput);
    console.log("hex: ", doubleNumbers);
    return doubleNumbers;
}

// takes hexademical numbers array
// concatenates them into slots
// returns array of slots
async function hexToBytes32(hexArray) {
    let i = 0;
    let bytes32String = "";
    let bytes32Strings = [];
    for (hex in hexArray) {
        bytes32String = bytes32String + hexArray[hex];
        // slot contains 16 uint16 numbers
        if (i == 15) {
            i = 0;
            bytes32Strings.push("0x" + bytes32String);
            bytes32String = "";
            continue;
        }
        i++;
    }

    if (i != 0) {
    bytes32String = ethers.utils.hexZeroPad("0x" + bytes32String, 32);
    bytes32Strings.push(bytes32String);
    }

    return bytes32Strings;
}
// get token positions for hardcoded tokenlist
// create map (position -> address) to order apy later
async function fetchTokenPositions(addressArray) {
    const [signer] = await ethers.getSigners();
    let ApyOracleFactory = await  ethers.getContractFactory("Float");
    let ApyOracle = ApyOracleFactory.attach(`0xE001e8A4A1078329862857F54C8DEf4EF865357d`);

    for (let i = 0; i < addressArray.length; i++) {
        let pos = await ApyOracle.position(addressArray[i]);
        positionToAddress.set(pos, addressArray[i]);
    }
}

// get hardcoded address array
// get apy for that address considering position in slot
// returns ordered apy array (ready to convert and concatenate into bytes32)
async function orderTokenApy(addressArray) {
    let slot = 0;
    let len = 0;
    let orderedApyArr = [];
    for (let i = 0; i < addressArray.length; i++) {
        let token = positionToAddress.get([slot, 30 - 2 * len]);
        let apy = addressToApy.get(token);
        if (len % 15 == 0) {
            slot++;
            len = 0;
        } else {
            len++;
        }
        if (apy == "undefined") {
            orderedApyArr.push(0);
            continue;
        }
        orderedApyArr.push(apy);
    }
    return orderedApyArr;
}


// functions to change token positions
async function splitArrayToFixedLength(addressesArray) {
    let i = 0;
    let arrayOfFixedArrays = [];
    let fixedArray = [];

    for (addresses in addressesArray) {
        fixedArray.push(addressesArray[addresses]);
        if (i == 15) {
            i = 0;
            arrayOfFixedArrays.push(fixedArray);
            fixedArray = [];
            continue;
        }
        i++;
    }
    if (i != 0) {
        arrayOfFixedArrays.push(fixedArray);
    }
    console.log(arrayOfFixedArrays);
    return arrayOfFixedArrays;
}
// functions to change token positions
async function addTokens(addressesArrays) {
    // note that apys are added "backwards", so add positions accordingly
    const [signer] = await ethers.getSigners();
    let ApyOracleFactory = await  ethers.getContractFactory("Float");
    let ApyOracle = ApyOracleFactory.attach(`0xE001e8A4A1078329862857F54C8DEf4EF865357d`);

    let PositionData = [];
    let positionDatas = [];
    let addresses = [];

    for (let i = 0; i < addressesArrays.length; i++) {
            for (let j = 0; j < addressesArrays[i].length; j++) {
                addresses.push(addressesArrays[i][j]);
                PositionData.push(i);
                PositionData.push(30 - 2 * j); // we cant take 32'nd byte

                positionDatas.push(PositionData);
                PositionData = [];
            }
    }
    console.log(positionDatas);
    console.log(addresses);

    let resp = await ApyOracle.addTokens(addresses, positionDatas);
    console.log(resp);
}

async function main() {
    // receive floats and adresses
    // getApy(yearnTokens);
    // let apyArray = await fetchYearnApy();
    // let doubleNumbers = await floatToFormatedHex(apyArray);
    // let bytes32Slots = await hexToBytes32(doubleNumbers);
    // let arrayOfAddressesArrays = await splitArrayToFixedLength(yearnTokens);

    // await addTokens(arrayOfAddressesArrays);
    await fetchTokenPositions(yearnTokens);
}
main();
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });