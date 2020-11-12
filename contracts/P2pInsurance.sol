// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "../p2p-insurance-front/node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import './Admin.sol';

contract P2pInsurance is Admin{
  mapping( uint => Insurance) public insurances; 
  mapping(address => User) private users; 
  mapping (address => bool) public insuredUsers;
  mapping (address => bool) public enrolled;

  uint insuranceCount;
  uint usersCount;
  uint feeAmount;
  
  
  struct User {
    uint id;
    address payable user;
    uint usableBalance;
    uint lockedBalance;
    uint investsCount;
    uint insuranceId;
  }

  struct Insurance {
      uint id;
    address investor;
    address client;
    uint duration; // todo must check type
    uint startTime;
    uint expireTime;
    Status status;
    uint investorPay;
    uint clientPay; // todo calculate clientPay with math
    address payable evaluator;
  }

  enum Status {
    INIT , INPROCESS, FINISHED
  }
  
  
  //events
  event LogUserEnrolled(address indexed accountAddress);
  event LogNewRequest(address indexed client, uint indexed insuranceId, uint indexed duration);
  event LogInsuranceAcceptedByInvestor(uint indexed insuranceId);
  event LogInsuranceFinished(uint indexed insuranceId);
  event LogWithdrawal(address indexed accountAddress, uint indexed withdrawAmount, uint indexed newBalance);
  //
  
  
  modifier isFinished(uint insuranceId){
      require(insurances[insuranceId].status == Status.FINISHED);
      _;
  }
  
  modifier isInProcess(uint insuranceId){
      require(insurances[insuranceId].status == Status.INPROCESS);
      _;
  }
  
  modifier isInit(uint insuranceId){
      require(insurances[insuranceId].status == Status.INIT && insurances[insuranceId].duration != 0);
      _;
  }
  
  modifier verifyCaller (address _address) { 
      require (msg.sender == _address); 
      _;
      
  }
  modifier hasEnoughBalance(uint _price) {
      require(SafeMath.add(users[msg.sender].usableBalance , msg.value) >= _price);
      _;
      
  }
  modifier isEnrolled() {
      require(enrolled[msg.sender]);
      _;
      
  }
  
  modifier isNotInsured(address _address) {
      require(!insuredUsers[_address]);
      _;
      
  }
  
  modifier isNotSamePerson(uint insuranceId) {
      require(insurances[insuranceId].client != msg.sender);
      _;   
  }

modifier isNotExpired(uint insuranceId) {
      require(insurances[insuranceId].expireTime <= now);
      _;   
  }

  modifier checkValue(uint _id) {
    //refund them after pay for item (why it is before, _ checks for logic before func)
    _;
    uint amountToRefund = msg.value - feeAmount;
    insurances[id].evaluator.transfer(amountToRefund);
  }
  
  constructor() public {
    insuranceCount = 0;
    usersCount = 0;
    feeAmount = 100;
  }

  function addUser() public stopInEmergency returns ( bool){
    users[msg.sender] = User({
        user: msg.sender,
        id: usersCount,
        usableBalance: 0,
        lockedBalance: 0,
        investsCount: 0,
        insuranceId: 0
    });
    enrolled[msg.sender] = true;
    usersCount += 1;
    emit LogUserEnrolled(msg.sender);
    return true;
  }
  
  function addNewRequest(uint _duration, uint _clientPay) public payable
  stopInEmergency
  isEnrolled
  hasEnoughBalance(_clientPay)
  {
      insuranceCount += 1;
      insurances[insuranceCount] = Insurance({
          id: insuranceCount,
          investor: address(0),
          client: msg.sender,
          duration: _duration,
          startTime: 0,
          expireTime: 0,
          status: Status.INIT,
          investorPay: 0,
          clientPay: _clientPay,
          evaluator: address(0)
      });
      // todo calculate investorPay by duration and clientPay
      User storage user = users[msg.sender];
      user.usableBalance += msg.value - _clientPay;
      user.lockedBalance += _clientPay;
      user.insuranceId = insuranceCount;
      emit LogNewRequest(msg.sender , insuranceCount , _duration );
  }
  
  function acceptAnRequestByInvestor(uint _id) public payable
  stopInEmergency
  isEnrolled
  isInit(_id)
  isNotInsured(insurances[_id].client)
  isNotSamePerson(_id)
  hasEnoughBalance(insurances[_id].investorPay){
      Insurance storage insurance = insurances[_id];
      insurance.investor = msg.sender;
      insurance.status = Status.INPROCESS;
      insurance.startTime = block.timestamp;
      insurance.expireTime = insurance.startTime + insurance.duration;
      require(insurance.expireTime > insurance.startTime ); // todo check this is correct
      User storage user = users[msg.sender];
      user.usableBalance = SafeMath.sub(SafeMath.add(SafeMath.add(msg.value , insurance.clientPay), user.usableBalance) , insurance.investorPay);
      user.lockedBalance = SafeMath.add(insurance.investorPay, user.lockedBalance);
      users[insurance.client].lockedBalance = SafeMath.sub(users[insurance.client].lockedBalance,insurance.clientPay);
      user.investsCount += 1;
      
      insuredUsers[insurance.client] = true;
      emit LogInsuranceAcceptedByInvestor(_id);
      
  }

  /// @notice Withdraw ether from bank
  /// @dev This does not return any excess ether sent to it
  /// @param withdrawAmount amount you want to withdraw
  /// @return The balance remaining for the user 
  function withdraw(uint withdrawAmount) public returns (uint) {
    User storage user = users[msg.sender];
    require(withdrawAmount <= user.usableBalance);
    user.usableBalance -= withdrawAmount;
    msg.sender.transfer(withdrawAmount);
    emit LogWithdrawal(msg.sender, withdrawAmount, user.usableBalance);
    return user.usableBalance;

  }
  
  function requestEvaluator(uint insuranceId) public payable 
  verifyCaller(insurances[insuranceId].client)
  isNotExpired(insuranceId)
  checkValue(insuranceId)
   returns(bool){
     require(msg.value >= feeAmount);
    Insurance storage insurance = insurances[insuranceId];
    insurance.evaluator = evaluators[availableEvaluator];
    changeAvailableEvaluator(availableEvaluator);
    return true;
  }

}
