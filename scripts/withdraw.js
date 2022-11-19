const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts;
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Withdrawing the funds");
    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("Funds have been withdrawn");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
