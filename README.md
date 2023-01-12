# ApyOracle v1
```shell
npm install
```
### create .env file and fill as .env.example

run this to attach to a contract and retreive/calculate numbers

you can leave sending tx as is, the contract has no Owner
```shell
npx hardhat run .\scripts\prepareNumbers.js --network goerli
```
```shell
npx hardhat test test\tests.js
```
```shell
npx prettier '**/*.{json,sol,js}' --write
```
