// same as:     const helperConfig = require("../helper-hardhat-config");
//              const networkConfig = helperConfig.networkConfig;
// we can do that because we did module.exports = {networkConfig} in helper-hardhat-config.js
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat"); //network coming from hardhat
require("dotenv").config();

// same as :   [...] = async (hre) => {const { getNamedAccounts, deployments } = hre;}
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const { verify } = require("../utils/verify");
    const chainId = network.config.chainId;

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    // If contract doesn't exist, we deploy a minimal version of it to local-testing

    // When we are in local, we use mock

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress]);
    }
    log("===============================================================\n");
};
module.exports.tags = ["all", "fundme"];
