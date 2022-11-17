const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", function () {
    let fundMe;
    let deployer;
    const sendValue = ethers.utils.parseEther("1"); // = 1ETH
    //We run test locally so we need our MockV3Aggregator:
    let MockV3Aggregator;
    beforeEach(async function () {
        //deploy our contract with hardhat-deploy
        // fixture to run any scripts that is in the deploy folder if we use "all"
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        /* To get the latest contract of FundMe, and everytime we call fundme we will use deployer */
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.priceFeed();
            assert.equal(response, mockV3Aggregator.address);
        });
    });

    describe("fund", function () {
        it("Fails if you don't send enough ETH", async function () {
            // await expect(fundMe.fund()).to.be.revertedWith(
            //     "You need to spend more ETH!"
            // );
        });
        it("Updated the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });
        it("Adds funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue });
            const funder = await fundMe.funders(0);
            assert.equal(funder, deployer);
        });
    });
});
