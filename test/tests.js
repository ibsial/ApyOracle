// Right click on the script name and hit "Run" to execute
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Float", function () {
    it("test initial value", async function () {
        const [signer] = await ethers.getSigners();
        const FloatContract = await ethers.getContractFactory("Float");
        const Float = await FloatContract.deploy();
        await Float.deployed();
        console.log("Float deployed at:" + Float.address);

        let yearnTokens = [
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
        let slots = [
            "0xc501d355c45dc267c00ec000c859c000e36ac000c680c5c6c000c000c000ca1e",
            "0xddfdd6bdc0000000000000000000000000000000000000000000000000000000",
        ];
        let positions = [
            [ 0, 0 ],  [ 0, 2 ],  [ 0, 4 ],
            [ 0, 6 ],  [ 0, 8 ],  [ 0, 10 ],
            [ 0, 12 ], [ 0, 14 ], [ 0, 16 ],
            [ 0, 18 ], [ 0, 20 ], [ 0, 22 ],
            [ 0, 24 ], [ 0, 26 ], [ 0, 28 ],
            [ 0, 30 ], [ 1, 0 ],  [ 1, 2 ],
            [ 1, 4 ]
          ];
          let addresses = [
            '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
            '0x82f0B8B456c1A451378467398982d4834b6829c1',
            '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
            '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
            '0x29b0Da86e484E1C0029B56e817912d778aC0EC69',
            '0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355',
            '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
            '0xD02a30d33153877BC20e5721ee53DeDEE0422B2F',
            '0x58e57cA18B7A47112b877E31929798Cd3D703b0f',
            '0x1E4F97b9f9F913c46F1632781732927B9019C68b',
            '0x74b23882a30290451A17c44f4F05243b6b58C76d',
            '0x321162Cd933E2Be498Cd2267a90534A804051b11',
            '0x468003B688943977e6130F4F68F23aad939a1040',
            '0x3129662808bEC728a27Ab6a6b9AFd3cBacA8A43c',
            '0x511D35c52a3C244E7b8bd92c0C297755FbD89212',
            '0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8',
            '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE',
            '0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1',
            '0x2dd7C9371965472E5A5fD28fbE165007c61439E1'
          ];

        await Float.addNumbers([0, 1], slots);
        await Float.addTokens(addresses, positions);
        
        for (i in yearnTokens) {
            let value = await Float.getValueForToken(addresses[i]);
            console.log(addresses[i], value);
        };
        /* real result taken from prepareNumbers.js
            0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83 1.281
            0x82f0B8B456c1A451378467398982d4834b6829c1 4.949
            0x04068DA6C83AFCFA0e13ba15A6696662335D5B75 1.117
            0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E 0.615
            0x29b0Da86e484E1C0029B56e817912d778aC0EC69 0.014
            0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355 0.000
            0x049d68029688eAbF473097a2fC38ef61633A3C7A 2.137
            0xD02a30d33153877BC20e5721ee53DeDEE0422B2F 0.000
            0x58e57cA18B7A47112b877E31929798Cd3D703b0f 9.066
            0x1E4F97b9f9F913c46F1632781732927B9019C68b 0.000
            0x74b23882a30290451A17c44f4F05243b6b58C76d 1.664
            0x321162Cd933E2Be498Cd2267a90534A804051b11 1.478
            0x468003B688943977e6130F4F68F23aad939a1040 0.000
            0x3129662808bEC728a27Ab6a6b9AFd3cBacA8A43c 0.000
            0x511D35c52a3C244E7b8bd92c0C297755FbD89212 0.000
            0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8 2.590
            0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE 7.678
            0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1 5.821
            0x2dd7C9371965472E5A5fD28fbE165007c61439E1 0.000
        */
    });
});
