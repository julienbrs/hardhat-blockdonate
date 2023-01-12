const { ethers, network } = require("hardhat");
const fs = require("fs");

const PATH_TO_NETWORK_MAPPING =
    "../../frontend/frontend-blockdonate/constants/networkMapping.json";
const PATH_TO_ABI = "../../frontend/frontend-blockdonate/constants/";
module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating frontend constants...");
        await updateContractAddresses();
        await updateAbi();
    }
};

async function updateContractAddresses() {
    const BlockDonate = await ethers.getContract("FundMe");
    const chainId = network.config.chainId.toString();
    const contractAddresses = JSON.parse(
        fs.readFileSync(PATH_TO_NETWORK_MAPPING, "utf8")
    );
    if (chainId in contractAddresses) {
        if (
            !contractAddresses[chainId]["FundMe"].includes(BlockDonate.address)
        ) {
            contractAddresses[chainId]["FundMe"].push(BlockDonate.address);
        }
    } else {
        contractAddresses[chainId] = {
            FundMe: [BlockDonate.address],
        };
    }
    fs.writeFileSync(
        PATH_TO_NETWORK_MAPPING,
        JSON.stringify(contractAddresses)
    );
}

async function updateAbi() {
    const BlockDonate = await ethers.getContract("FundMe");
    fs.writeFileSync(
        `${PATH_TO_ABI}FundMe.json`,
        BlockDonate.interface.format(ethers.utils.FormatTypes.json)
    );
}

module.exports.tags = ["all", "frontend"];
