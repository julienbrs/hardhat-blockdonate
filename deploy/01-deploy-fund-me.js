// same as:     const helperConfig = require("../helper-hardhat-config");
//              const networkConfig = helperConfig.networkConfig;
// we can do that because we did module.exports = {networkConfig} in helper-hardhat-config.js
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat"); //network coming from hardhat

// same as :   [...] = async (hre) => {const { getNamedAccounts, deployments } = hre;}
module.exports.default = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    // if contract doesn't exist, we deploy a minimal version of it to local-testing

    // when we are in local, we use mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address as an argument
        log: true,
    });
    log("===============================================================\n");
};
module.exports.tags = ["all", "fundme"];
