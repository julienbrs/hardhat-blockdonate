const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

// We check that we are on a development chain
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
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
                  const response = await fundMe.getPriceFeed();
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
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });
              it("Adds funder to array of s_funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("getNumberBackers", function () {
              it("Should return that only 1 backer", async function () {
                  await fundMe.fund({ value: sendValue });
                  const numberBackers = await fundMe.getNumberBackers();
                  assert.equal(numberBackers, 1);
              });
          });

          describe("withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("Withdraw ETH from a single founder", async function () {
                  /* way to think process of test: Arrange, Act, Assert */
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(
                          // Assert
                          deployer
                      );
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      // we use bigNumber.add(bigNumber) cuz getBalance returns a bigNumber
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("allows us to withdraw with multiple s_funders", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  // i = 0 is the deployer
                  for (let i = 1; i < 6; i++) {
                      // before that, whenever we call fundMe contract, deployer is the acc cf
                      // getContract("FundMe", deployer) lign 16
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(
                          // Assert
                          deployer
                      );
                  // Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      // we use bigNumber.add(bigNumber) cuz getBalance returns a bigNumber
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // We make sur that s_funders in mapping are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("Only Owner can withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });

              it("Withdraw ETH from a single founder", async function () {
                  /* way to think process of test: Arrange, Act, Assert */
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(
                          // Assert
                          deployer
                      );
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      // we use bigNumber.add(bigNumber) cuz getBalance returns a bigNumber
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("cheaperWithdraw testing for multiple s_funders", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  // i = 0 is the deployer
                  for (let i = 1; i < 6; i++) {
                      // before that, whenever we call fundMe contract, deployer is the acc cf
                      // getContract("FundMe", deployer) lign 16
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(
                          // Assert
                          deployer
                      );
                  // Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      // we use bigNumber.add(bigNumber) cuz getBalance returns a bigNumber
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // We make sur that s_funders in mapping are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
          });
      });
