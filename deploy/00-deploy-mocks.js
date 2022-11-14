const { network } = require("hardhat");
module.exports = async ({ getNamedAccouts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
};
