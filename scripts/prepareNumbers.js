// const hre = require("hardhat");
const { ethers } = require("hardhat");

/* todo:
    1) подключить ещё 2 api эндпойнта 

    6) сделать обработку ошибки фетч

    *) сделать подтверждение через что-либо, напр телегу
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

// fetch apy for fantom
// set map (address -> apy) to get values later
async function fetchYearnApy() {
    let url = `https://api.yearn.finance/v1/chains/250/vaults/all`;
    let response = await fetch(url, {});
    let data = await response.json();
    console.log("initial data fetched from yEarn:");

    for (let i = 0; i < data.length; i++) {
        // convert to percentage and leave only 3 decimals
        addressToApy.set(
            data[i].token.address,
            (data[i].apy.net_apy * 100).toFixed(3)
        );
        console.log(
            data[i].token.address,
            (data[i].apy.net_apy * 100).toFixed(3)
        );
    }
}

// get token positions for hardcoded tokenlist
// create map (position -> address) to order apy later
async function fetchTokenPositions(addressArray) {
    const [signer] = await ethers.getSigners();
    let ApyOracleFactory = await ethers.getContractFactory("Float");
    let ApyOracle = ApyOracleFactory.attach(
        `0xE001e8A4A1078329862857F54C8DEf4EF865357d`
    );

    for (let i = 0; i < addressArray.length; i++) {
        let pos = await ApyOracle.position(addressArray[i]);
        positionToAddress.set(`${pos}`, addressArray[i]);
    }
}

// take hardcoded address array
// get apy for that address considering position in slot
// returns ordered apy array (ready to convert and concatenate into bytes32)
function orderTokenApy(addressArray) {
    let slot = 0;
    let orderedApyArr = [];
    console.log("order received data");
    for (let i = 0; i < addressArray.length; i++) {
        let token = positionToAddress.get(`${slot},${2 * (i % 16)}`);
        let apy = addressToApy.get(token);
        console.log(token, apy, `slot: ${slot}, fraction ${2 * (i % 16)}`);

        if (i % 15 == 0 && i != 0) {
            slot++;
        }
        if (apy == undefined) {
            orderedApyArr.push("0.000");
            continue;
        }
        orderedApyArr.push(apy);
    }
    console.log("\norderedApyArray: \n", orderedApyArr);
    return orderedApyArr;
}

// takes apy array and converts to desired Hex
// float -> binary(mantissa + integer) -> hex(binary)
// returns hex array sorted like hardcoded tokenlist
function floatToFormatedHex(inputFloatNumbers) {
    // receive normal float numbers
    // convert them to appropriate format e.g. xxx.xxx
    // max number is 16383
    // min number is 0 (0.001)

    // convert inputFloatNumbers to double binary
    let doubleNumbers = [];
    let binaryOutput = [];

    console.log("converting floats to hex");

    for (number in inputFloatNumbers) {
        /* 
        feature to write numbers in a smart way
        we need to keep variety between very big and very small numbers
        so if num > 99 && < 1000
           => keep 2 zeroes
        if num > 999 && < 10000
           => keep 1 zero
        if num > 9999
           => cut all zeroes
        */
        if (parseFloat(inputFloatNumbers[number]) > 99) {
            inputFloatNumbers[number] = parseFloat(inputFloatNumbers[number])
                .toFixed(2)
                .toString();

            if (inputFloatNumbers[number] > 999) {
                inputFloatNumbers[number] = parseFloat(
                    inputFloatNumbers[number]
                )
                    .toFixed(1)
                    .toString();
            }

            if (inputFloatNumbers[number] > 9999) {
                inputFloatNumbers[number] =
                    inputFloatNumbers[number].split(".")[0];
            }
        }

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

        // check if number is > 16383
        //  if true put 16383
        if (mantissaToBinary.length + decToBinary.length > 16) {
            console.log("FAIL! \nconverting this number to max int14");
            decToBinary = parseInt("16383").toString(2);
        }

        // append zeros after mantissa if binary length < 16
        if (mantissaToBinary.length + decToBinary.length < 16) {
            let diff = 16 - mantissaToBinary.length - decToBinary.length;
            // console.log("lacking zeros: ", diff);
            mantissaToBinary = mantissaToBinary + "0".repeat(diff);
            // console.log(mantissaToBinary);
        }

        let encodedBinary = mantissaToBinary + decToBinary;

        // console.log("binary result: ", encodedBinary);
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
function hexToBytes32(hexArray) {
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
        bytes32String = "0x" + bytes32String + "0000".repeat(16 - i);
        bytes32Strings.push(bytes32String);
    }
    console.log("slots to post!");
    console.log(bytes32Strings);
    return bytes32Strings;
}

async function sendApySlots(newApySlots) {
    const [signer] = await ethers.getSigners();
    let ApyOracleFactory = await ethers.getContractFactory("Float");
    let ApyOracle = ApyOracleFactory.attach(
        `0xE001e8A4A1078329862857F54C8DEf4EF865357d`
    );

    let slots = [];
    for (slot in newApySlots) {
        slots.push(slot);
    }
    console.log("\nsending tx with such parameters (;;;*_*)");
    console.log(slots, newApySlots);
    let res = await ApyOracle.addNumbers(slots, newApySlots);
    console.log(res);
    console.log("and done!ヽ(°〇°)ﾉ");
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
    const [signer] = await ethers.getSigners();
    let ApyOracleFactory = await ethers.getContractFactory("Float");
    let ApyOracle = ApyOracleFactory.attach(
        `0xE001e8A4A1078329862857F54C8DEf4EF865357d`
    );

    let PositionData = [];
    let positionDatas = [];
    let addresses = [];

    for (let i = 0; i < addressesArrays.length; i++) {
        for (let j = 0; j < addressesArrays[i].length; j++) {
            addresses.push(addressesArrays[i][j]);
            PositionData.push(i);
            PositionData.push(2 * j);

            positionDatas.push(PositionData);
            PositionData = [];
        }
    }
    console.log(positionDatas);
    console.log(addresses);

    // comment these 2 lines to see calculations only
    let resp = await ApyOracle.addTokens(addresses, positionDatas);
    console.log(resp);
}

async function postNewApy() {
    await fetchYearnApy().catch(
        (error) =>
            async function () {
                // what should be here?
                console.log("fetch failed..");
                await new Promise(r => setTimeout(r, 5000));
                await fetchYearnApy();
            }
    );
    await fetchTokenPositions(yearnTokens);
    let orderedApyArr = orderTokenApy(yearnTokens);
    let doubleNumbersArr = floatToFormatedHex(orderedApyArr);
    let newApySlots = hexToBytes32(doubleNumbersArr);
    await sendApySlots(newApySlots); // comment this function to see calculations only
}

async function changeTokenPositions() {
    let arrayOfAddressesArrays = await splitArrayToFixedLength(yearnTokens);
    await addTokens(arrayOfAddressesArrays);
}
async function main() {
    postNewApy();

    // changeTokenPositions();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
