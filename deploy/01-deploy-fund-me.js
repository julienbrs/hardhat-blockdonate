// same as:     const helperConfig = require("../helper-hardhat-config");
//              const networkConfig = helperConfig.networkConfig;
// we can do that because we did module.exports = {networkConfig} in helper-hardhat-config.js
const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");

// same as :   [...] = async (hre) => {const { getNamedAccounts, deployments } = hre;}
module.exports.default = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

    // if contract doesn't exist, we deploy a minimal version of it to local-testing

    // when we are in local, we use mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [], // put price feed address as an argument
        log: true,
    });
};
