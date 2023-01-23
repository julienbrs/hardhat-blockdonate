// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner(); //coding style for error: Contract_Error()

/**
 * @title A contract for crowd funding
 * @author julienbrs, credit to FreeCodeCamp & Patric Collins
 * @notice You can use this contract for basic crowd funding and keeping tracks of donators
 * @dev This implements price feed in our library
 *
 */
contract FundMe {
    /* Type declaration */
    using PriceConverter for uint256;

    /* State Variables */
    mapping(address => uint256) private s_addressToAmountFunded; //s_Name for storage variable
    address[] private s_funders;
    uint256 amountFounded;

    address private immutable i_owner; // i_immutable
    uint256 public constant MINIMUM_USD = 1 * 10 ** 18;

    AggregatorV3Interface private s_priceFeed;

    /* Modifiers */
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    /* Functions */

    constructor(address priceFeedAdress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAdress);
        amountFounded = 0;
    }

    /**
     * @notice Funding the contract
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        amountFounded += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        // we read in storage only once, then we read in memory.
        // /!\ We can't put mapping in memory
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getAmountFunded() public view returns (uint256) {
        return amountFounded;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getNumberBackers() public view returns (uint256) {
        return s_funders.length;
    }
}
