// Right click on the script name and hit "Run" to execute
const { ethers } = require("hardhat");
const { expect } = require("chai");

var addressToApy = new Map();
var positionToAddress = new Map();

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

const retryYearnFetch = async () => {
    try {
        await fetchYearnApy();
    } catch (err) {
        console.log("fetch failed.. Retry in 5 sec");
        await new Promise((r) => setTimeout(r, 5000));
        return retryYearnFetch();
    }
};
const yearnTokens = [
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

describe("Float", function () {
    it("test initial value", async function () {
        const [signer] = await ethers.getSigners();
        const ApyOracleContract = await ethers.getContractFactory("Float");
        const ApyOracle = await ApyOracleContract.deploy();
        await ApyOracle.deployed();
        console.log("ApyOracle deployed at:" + ApyOracle.address);

        i = 0;
        let arrayOfFixedArrays = [];
        let fixedArray = [];

        for (addresses in yearnTokens) {
            fixedArray.push(yearnTokens[addresses]);
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

        //add tokens to contract
        let PositionData = [];
        let positionDatas = [];
        let addr = [];

        for (let i = 0; i < arrayOfFixedArrays.length; i++) {
            for (let j = 0; j < arrayOfFixedArrays[i].length; j++) {
                addr.push(arrayOfFixedArrays[i][j]);
                PositionData.push(i);
                PositionData.push(2 * j);

                positionDatas.push(PositionData);
                PositionData = [];
            }
        }
        console.log(positionDatas);
        console.log(addr);
        let resp = await ApyOracle.addTokens(addr, positionDatas);
        // console.log(resp);

        // fetch APY
        await retryYearnFetch();
        // for (i in yearnTokens) {
        //     addressToApy.set(yearnTokens[i], (Math.random()*(10**(i%4))).toFixed(3));
        //     console.log(yearnTokens[i], (Math.random()*(10**(i%4))).toFixed(3));
        // }

        // fetch token positions from contract
        for (let i = 0; i < yearnTokens.length; i++) {
            let pos = await ApyOracle.position(yearnTokens[i]);
            positionToAddress.set(`${pos}`, yearnTokens[i]);
            console.log(`${pos}`, yearnTokens[i]);
        }

        // order received data
        let slot = 0;
        let orderedApyArr = [];
        console.log("order received data");
        for (let i = 0; i < yearnTokens.length; i++) {
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

        // convert float to desired format
        let doubleNumbers = [];
        let binaryOutput = [];

        console.log("converting floats to hex");
        for (number in orderedApyArr) {
            function workaroundNum(string) {
                return parseFloat(
                    orderedApyArr[number].split(".")[0] +
                        orderedApyArr[number].split(".")[1]
                );
            }
            if (workaroundNum(orderedApyArr[number]) >= 1638300) {
                // 1638.300
                orderedApyArr[number] = parseFloat(orderedApyArr[number])
                    .toFixed(1)
                    .toString();
            }

            if (workaroundNum(orderedApyArr[number]) > 163830) {
                // 163.830
                orderedApyArr[number] = orderedApyArr[number].split(".")[0];
            }
            if (workaroundNum(orderedApyArr[number]) > 16383) {
                // 16.383
                orderedApyArr[number] = parseFloat(orderedApyArr[number])
                    .toFixed(2)
                    .toString();
            }

            // split float number into integer and decimal parts
            let integerPart = orderedApyArr[number].split(".")[0];
            let decimalPart = orderedApyArr[number].split(".")[1];

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

        // numbers to slots
        i = 0;
        let bytes32String = "";
        let bytes32Strings = [];
        for (hex in doubleNumbers) {
            bytes32String = bytes32String + doubleNumbers[hex];
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

        slots = [];
        for (slot in bytes32Strings) {
            slots.push(slot);
        }
        console.log("\nsending tx with such parameters (;;;*_*)");
        console.log(slots, bytes32Strings);
        let res = await ApyOracle.addNumbers(slots, bytes32Strings);
        console.log(res);
        console.log("and done!ヽ(°〇°)ﾉ");

        let ApySent = [];
        let ApyWritten = [];
        for (i = 0; i < yearnTokens.length; i++) {
            ApySent.push(addressToApy.get(yearnTokens[i]));
            ApyWritten.push(
                (await ApyOracle.getValueForToken(yearnTokens[i])).toString()
            );
        }
        console.log("apy sent: ", ApySent);
        console.log("apy written: ", ApyWritten);
    });
});
