/* we don't need a mock because we are on a testnet, and no need to deploy because we assume it is already done */
const { inputToConfig } = require("@ethereum-waffle/compiler");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

// We check if we aren't on a development chain, so on a testnet
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          console.log("Starting staging test");
          let fundMe;
          let deployer;
          const sendValue = ethers.utils.parseEther("0.1");
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("Allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              assert.equal(endingBalance.toString(), 0);
          });
      });
