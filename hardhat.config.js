// require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require('dotenv').config();
module.exports = {
    solidity: "0.8.13",
    networks: {
      hardhat: {
      },
      goerli: {
        url: `https://eth-goerli.g.alchemy.com/v2/${ process.env.ALCHEMY_KEY }`,
        accounts: [ `${ process.env.PRIVATE_KEY }`]
      },
    },
    etherscan: {
      apiKey: {
        rinkeby: `${ process.env.ETHERSCAN_KEY }`
      }
    }
  };