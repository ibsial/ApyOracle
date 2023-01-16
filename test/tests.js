// Right click on the script name and hit "Run" to execute
const { ethers } = require("hardhat");
const { expect } = require("chai");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

var addressToApy = new Map();
var positionToAddress = new Map();
var beefyAddressToName = new Map();

////////////////////////////////
// todo
// think about NaN in beefy
// set it to zero?
////////////////////////////////

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

const retryFetch = async (action) => {
    try {
        await action();
    } catch (err) {
        console.log("fetch failed.. Retry in 20 sec");
        await new Promise((r) => setTimeout(r, 20000));
        return retryFetch();
    }
};

async function fetchBeefyVaultName() {
    let url = `https://api.beefy.finance/vaults`;
    let response = await fetch(url, {});
    let data = await response.json();
    console.log("data fetched from beefy/vaults:");

    for (let i = 0; i < data.length; i++) {
        beefyAddressToName.set(data[i].tokenAddress, data[i].id);
        // console.log(data[i].tokenAddress, data[i].id);
    }
}

async function fetchBeefyApy() {
    let url = `https://api.beefy.finance/apy`;
    let response = await fetch(url, {});
    let data = await response.json();
    for (let i = 0; i < beefyTokens.length; i++) {
        let name = beefyAddressToName.get(beefyTokens[i]);
        addressToApy.set(beefyTokens[i], (data[name] * 100).toFixed(3));
        console.log(beefyTokens[i], name, (data[name] * 100).toFixed(3));
    }
}

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
const beefyTokens = [
    "0xd6070ae98b8069de6B494332d1A1a81B6179D960", // BIFI Maxi
    "0x91f7120898b4be26cC1e84F421e76725c07d1361", // DEI-USDC LP
    "0xaF918eF5b9f33231764A5557881E6D3e5277d456", // DEUS-FTM LP
    "0xA58F16498c288c357e28EE899873fF2b55D7C437", // MAI3Pool-f
    "0x4E415957AA4Fd703ad701e43Ee5335D1D7891D83", // Another DEI, another dollar
    "0x244af40a992B256A54891d9676B1D29Be46b1449", // COMB-FTM vLP
    "0xDeBC5451640C57Ff96af47589F55C98E9e7bC0DF", // sFTMx-FTM sLP
    "0xf97EeEcCd070ceEcA8d0Dd80Fc78CC15Dd66b0E5", // ETH-FTM vLP
    "0xAfEcf681a8f3FB8D78581874339Bfca6252d62C4", // BUSD-USDC sLP
    "0x3518C1A770E12CD3F5a36Bd950A60175ecf5B35d", // gALCX-FTM vLP
    "0x364705F8D0744230f39BC176e0270d90dbc72E50", // MIM-USDC sLP
    "0x6EAFdEa1EB68dcf716cF1944b8165Ad8b05677D2", // alUSD-USDC sLP
    "0x4226525Ee9B07E8d27D4F2619044af2576A43511", // MAI-USDC sLP
    "0x842C44870eD021f070938D077ca2Cf2DC474eCa6", // fUSDT-FTM vLP
    "0xBAa9fCE81A12BD2aeF29aEA6B7047DAcfa20f96E", // WBTC-FTM vLP
    "0x772bC1196C357F6E9c80e1cc342e29B3a5F05ef3", // USDC-FTM vLP
    "0x55167b5917A47EEafE2b1afEd12Bcb3Aaab54255", // FRAX-USDC sLP
    "0x9692129bb91b4E3942C0f17B0bdCC582Ff22fFB5", // DAI-USDC sLP
    "0x40DEa26Dd3a0d549dC5Ecd4522045e8AD02f83FB", // fUSDT-USDC sLP
    "0x912B333dDaFC925f63C9746E5115A2CD5290b59e", // SPIRIT-FTM vLP
    "0x73240EC27CB4F40E25658395335896059A1961d0", // binSPIRIT-SPIRIT vLP
    "0xE72077036E01FD50B39c521cf5Af7200C611fAa5", // BIFI-FTM vLP
    "0xbcab7d083Cf6a01e0DdA9ed7F8a02b47d125e682", // MIM-USDC sLP
    "0xBad7D3DF8E1614d985C3D9ba9f6ecd32ae7Dc20a", // USDC-FTM vLP
    "0xe4bc39fdD4618a76f6472079C329bdfa820afA75", // SOLID-FTM vLP
    "0x3129662808bEC728a27Ab6a6b9AFd3cBacA8A43c", // DOLA
    "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355", // FRAX
    "0x82f0B8B456c1A451378467398982d4834b6829c1", // MIM
    "0xC9B98e4A4e306DFc24bc5b5F66e271e19Fd74c5A", // wMEMO-MIM SLP
    "0x78f82c16992932EfDd18d93f889141CcF326DBc2", // SPELL-FTM LP
    "0x58e57cA18B7A47112b877E31929798Cd3D703b0f", // crv3crypto
    "0xe7E90f5a767406efF87Fdad7EB07ef407922EC1D", // USDC-FTM SLP
    "0x374C8ACb146407Ef0AE8F82BaAFcF8f4EC1708CF", // CRV-FTM SLP
    "0x6B5340dFcd7D509Ea931cC4E69462797DbBc0197", // WBTC-USDC LP
    "0x1E4F97b9f9F913c46F1632781732927B9019C68b", // CRV
    "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8", // LINK
    "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC
    "0x321162Cd933E2Be498Cd2267a90534A804051b11", // WBTC
    "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", // DAI
    "0x74b23882a30290451A17c44f4F05243b6b58C76d", // ETH
    "0x049d68029688eAbF473097a2fC38ef61633A3C7A", // fUSDT
    "0x0845c0bFe75691B1e21b24351aAc581a7FB6b7Df", // YFI-ETH LP
    "0x27E611FD27b276ACbd5Ffd632E5eAEBEC9761E40", // 2poolCRV
    "0x6f86e65b255c9111109d2D2325ca2dFc82456efc", // MIM-FTM LP
    "0xEc7178F4C41f346b2721907F5cF7628E388A7a58", // BOO-FTM LP
    "0x1656728af3a14e1319F030Dc147fAbf6f627059e", // BIFI-FTM LP
    "0x623EE4a7F290d11C11315994dB70FB148b13021d", // ICE-FTM LP
    "0xf84E313B36E86315af7a06ff26C8b20e9EB443C3", // SUSHI-FTM LP
    "0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c", // USDC-FTM LP
    "0x5c021D9cfaD40aaFC57786b409A9ce571de375b4", // ANY-FTM LP
];

var combinedTokens = yearnTokens.concat(beefyTokens);

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

        for (addresses in combinedTokens) {
            fixedArray.push(combinedTokens[addresses]);
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
        await retryFetch(fetchYearnApy);
        // await retryFetch(fetchBeefyVaultName);
        await fetchBeefyVaultName();

        // await retryFetch(fetchBeefyApy);

        await fetchBeefyApy();

        // for (i in yearnTokens) {
        //     addressToApy.set(yearnTokens[i], (Math.random()*(10**(i%4))).toFixed(3));
        //     console.log(yearnTokens[i], (Math.random()*(10**(i%4))).toFixed(3));
        // }

        // fetch token positions from contract
        for (let i = 0; i < combinedTokens.length; i++) {
            let pos = await ApyOracle.position(combinedTokens[i]);
            positionToAddress.set(`${pos}`, combinedTokens[i]);
            console.log(`${pos}`, combinedTokens[i]);
        }

        // order received data
        let slot = 0;
        let orderedApyArr = [];
        console.log("order received data");
        for (let i = 0; i < combinedTokens.length; i++) {
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
        // console.log(res);
        console.log("and done!ヽ(°〇°)ﾉ");

        let ApySent = [];
        let ApyWritten = [];
        for (i = 0; i < combinedTokens.length; i++) {
            ApySent.push(addressToApy.get(combinedTokens[i]));
            ApyWritten.push(
                (await ApyOracle.getValueForToken(combinedTokens[i])).toString()
            );
        }
        console.log("apy sent: ", ApySent);
        console.log("apy written: ", ApyWritten);
    });
});
