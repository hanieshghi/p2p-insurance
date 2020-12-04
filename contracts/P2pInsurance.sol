// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import './Admin.sol';

contract P2pInsurance is Admin{
  mapping( uint => Insurance) private insurances;
  mapping(address => User) private users;
  mapping (address => bool) private insuredUsers;
  mapping (address => uint[100]) private userInsurancesAsClient;
  mapping (address => uint[100]) private userInsurancesAsInvestor;
  // mapping (address => bool) public enrolled;
  uint public insuranceCount;
  uint public usersCount;
  // uint public feeAmount;


  struct User {
    uint id;
    address payable user;
    uint usableBalance;
    uint lockedBalance;
    uint investsCount;
    uint insuranceCount;
    uint insuranceId;
  }

  struct Insurance {
    uint id;
    address investor;
    address client;
    uint duration;
    uint startTime;
    uint expireTime;
    Status status;
    uint investorPay;
    uint clientPay;
    address evaluator;
    EvaluatorStatus evaluatorStatus;
  }

  enum Status {
    INIT , INPROCESS, WAITINGFORAVALUATION ,FINISHED
  }
  enum EvaluatorStatus {
    EMPTY ,ACCEPTED , REJECTED
  }


  //events
  event LogUserEnrolled(address indexed accountAddress);
  event LogNewRequest(address indexed client, uint indexed insuranceId, uint indexed duration);
  event LogInsuranceAcceptedByInvestor(uint indexed insuranceId);
  event LogInsuranceFinished(uint indexed insuranceId , uint startTime, uint endTime, uint now);
  event LogWithdrawal(address indexed accountAddress, uint indexed withdrawAmount, uint indexed newBalance);
    event LogSetEvaluator(uint indexed insuranceId, address indexed evaluator);
  //


  modifier isFinished(uint insuranceId){
      require(insurances[insuranceId].status == Status.FINISHED);
      _;
  }

  modifier isInProcess(uint insuranceId){
      require(insurances[insuranceId].status == Status.INPROCESS);
      _;
  }

  modifier isWaiting(uint insuranceId){
    require(insurances[insuranceId].status == Status.WAITINGFORAVALUATION);
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

  modifier isNotInsured(address _address) {
      require(!insuredUsers[_address]);
      _;

  }

  modifier isNotSamePerson(uint insuranceId) {
      require(insurances[insuranceId].client != msg.sender);
      _;
  }

//  modifier isNotExpired(uint insuranceId) {
//      require(insurances[insuranceId].expireTime <= now);
//      _;
//  }

  modifier isExpired(uint insuranceId) {
      require(insurances[insuranceId].expireTime  < now);
      _;
  }

  modifier isEmpty(uint insuranceId) {
      require(insurances[insuranceId].evaluatorStatus == EvaluatorStatus.EMPTY);
      _;
  }


  constructor() public {
    insuranceCount = 0;
    usersCount = 0;
    // feeAmount = 100;
  }

  /// @notice add new user
  /// @dev This is internal and cannot be called from outside
  function addUser() internal {
    users[msg.sender] = User({
        user: msg.sender,
        id: usersCount,
        usableBalance: 0,
        lockedBalance: 0,
        investsCount: 0,
        insuranceCount: 0,
        insuranceId: 0
    });
    // enrolled[msg.sender] = true;
    usersCount += 1;
    emit LogUserEnrolled(msg.sender);
  }

  /// @notice Add new insurance request by client
  /// @dev insuranceId 0 is skipped.
  /// @dev duration is in day
  /// @param _duration amount you want to be insured
  /// @param _clientPay amount you want to pay
  /// @return insuranceCount the id of the new insurance
  function addNewRequest(uint _duration, uint _clientPay) public payable
  stopInEmergency
  isNotOwner
  hasEnoughBalance(_clientPay) returns(uint)
  {
    if(users[msg.sender].user == address(0)){
      addUser();
    }
    require(users[msg.sender].insuranceId == 0 || insurances[users[msg.sender].insuranceId].status == Status.FINISHED);
    require(users[msg.sender].insuranceCount < 100);
    insuranceCount += 1;
    insurances[insuranceCount] = Insurance({
      id: insuranceCount,
      investor: address(0),
      client: msg.sender,
      duration: _duration,
      startTime: 0,
      expireTime: 0,
      status: Status.INIT,
      investorPay: SafeMath.mul(_clientPay , SafeMath.mul(_duration, 4)) ,
      clientPay: _clientPay,
      evaluator: address(0),
      evaluatorStatus: EvaluatorStatus.EMPTY
    });
    User storage user = users[msg.sender];
    user.usableBalance += msg.value - _clientPay;
    user.lockedBalance += _clientPay;
    user.insuranceId = insuranceCount;
    userInsurancesAsClient[msg.sender][insuranceCount] = user.insuranceId;
    user.insuranceCount += 1;
    emit LogNewRequest(msg.sender , insuranceCount , _duration );
    return insuranceCount;
  }

  /// @notice Accept a requested insurance by investor
  /// @param _id of insurance
  /// @return true
  function acceptARequestByInvestor(uint _id) public payable
  stopInEmergency
  isNotOwner
  isInit(_id)
  isNotSamePerson(_id)
  hasEnoughBalance(insurances[_id].investorPay) returns(bool){
    if(users[msg.sender].user == address(0)){
      addUser();
    }
    require(users[msg.sender].investsCount <= 100);
      Insurance storage insurance = insurances[_id];
      insurance.investor = msg.sender;
      insurance.status = Status.INPROCESS;
      insurance.startTime = now;
      insurance.expireTime = insurance.startTime +  insurance.duration * 1 days ;

      User storage user = users[msg.sender];
      user.usableBalance = SafeMath.sub(SafeMath.add(SafeMath.add(msg.value , insurance.clientPay), user.usableBalance) , insurance.investorPay);
      user.lockedBalance = SafeMath.add(insurance.investorPay, user.lockedBalance);
      users[insurance.client].lockedBalance = SafeMath.sub(users[insurance.client].lockedBalance,insurance.clientPay);
      userInsurancesAsInvestor[msg.sender][user.investsCount] = insurance.id;
    user.investsCount += 1;

      insuredUsers[insurance.client] = true;
      emit LogInsuranceAcceptedByInvestor(_id);
      return true;
  }

  /// @notice Withdraw custom amount
  /// @dev This does not return any excess ether sent to it
  /// @param withdrawAmount amount you want to withdraw
  /// @return The balance remaining for the user
  function withdrawCustomAmount(uint withdrawAmount)  stopInEmergency public returns (uint) {
    User storage user = users[msg.sender];
    require(withdrawAmount <= user.usableBalance);
    user.usableBalance -= withdrawAmount;
    msg.sender.transfer(withdrawAmount);
    emit LogWithdrawal(msg.sender, withdrawAmount, user.usableBalance);
    return user.usableBalance;

  }

  /// @notice Withdraw all balance. it works only in emergency
  /// @dev This does not return any excess ether sent to it
  function withdraw()   onlyInEmergency public{
    User storage user = users[msg.sender];
//    require(user.usableBalance > 0);
      uint withdrawAmount = user.usableBalance;
    user.usableBalance = 0;
    msg.sender.transfer(withdrawAmount);
    emit LogWithdrawal(msg.sender, withdrawAmount, user.usableBalance);
  }


  /// @notice client requests for evaluation
  /// @dev for simplicity not the evaluator is the owner
  /// @param insuranceId id of insurance
  /// @return false if insurance has expired otherwise returns true
  function requestEvaluator(uint insuranceId)
  stopInEmergency
  verifyCaller(insurances[insuranceId].client)
  // isNotExpired(insuranceId)
  isEmpty(insuranceId)
  // checkValue(insuranceId)
  public
   returns(bool){
    require(insurances[insuranceId].evaluator == address(0));
     if(insurances[insuranceId].expireTime < now){
       checkIfIsExpired(insuranceId);
       return false;
     }else{
      // require(msg.value >= feeAmount);
      Insurance storage insurance = insurances[insuranceId];
      insurance.evaluator = evaluators[0];
       insurance.status = Status.WAITINGFORAVALUATION;
//      insurance.evaluator = evaluators[availableEvaluator];
//      changeAvailableEvaluator(availableEvaluator);
      emit LogSetEvaluator(insuranceId, insurance.evaluator);
      return true;
     }

  }

  /// @notice evalator accepts refund to client
  /// @param insuranceId id of insurance
  /// @return true
  function refundToClient(uint insuranceId)
  stopInEmergency
  verifyCaller(insurances[insuranceId].evaluator)
  isEmpty(insuranceId)
  isWaiting(insuranceId) public
   returns(bool){
    Insurance storage insurance = insurances[insuranceId];
    insurance.evaluatorStatus = EvaluatorStatus.ACCEPTED;
    insurance.status = Status.FINISHED;

    User storage client = users[insurance.client];
    User storage investor = users[insurance.investor];

    investor.lockedBalance -= insurance.investorPay;
    client.usableBalance += insurance.investorPay;

    emit LogInsuranceFinished(insuranceId, insurance.startTime, insurance.expireTime, now);
    return true;
  }


  /// @notice evaluator reject refund to client.
  /// @param insuranceId id of insurance
  /// @return true
  function refundToInvestor(uint insuranceId)
  stopInEmergency
  verifyCaller(insurances[insuranceId].evaluator)
  isEmpty(insuranceId)
  isWaiting(insuranceId) public
   returns(bool){
    Insurance storage insurance = insurances[insuranceId];
    insurance.evaluatorStatus = EvaluatorStatus.REJECTED;
    insurance.status = Status.FINISHED;

//    User storage client = users[insurance.client];
    User storage investor = users[insurance.investor];

    investor.lockedBalance -= insurance.investorPay;
    investor.usableBalance += insurance.investorPay;

    emit LogInsuranceFinished(insuranceId, insurance.startTime, insurance.expireTime ,now);
    return true;
  }

  /// @notice check if insurance is expired
  /// @param insuranceId id of insurance
  /// @return true
  function checkIfIsExpired(uint insuranceId) public
  isEmpty(insuranceId)
  isInProcess(insuranceId)
   returns(bool){
    if(insurances[insuranceId].expireTime  < now){
      Insurance storage insurance = insurances[insuranceId];
      insurance.status = Status.FINISHED;

      //    User storage client = users[insurance.client];
      User storage investor = users[insurance.investor];

      investor.lockedBalance -= insurance.investorPay;
      investor.usableBalance += insurance.investorPay;

      emit LogInsuranceFinished(insuranceId, insurance.startTime, insurance.expireTime, now);
      return true;
    }else{
      return false;
    }

  }

    /// @notice fetch user info by address
    /// @param _user address of user
    function fetchUser(address _user) public view returns(
        uint id, address user, uint usableBalance, uint lockedBalance, uint investsCount, uint insuranceId
    ) {
        id = users[_user].id;
        user = users[_user].user;
        usableBalance = users[_user].usableBalance;
        lockedBalance = users[_user].lockedBalance;
        investsCount = users[_user].investsCount;
        insuranceId = users[_user].insuranceId;
        return (id, user, usableBalance, lockedBalance, investsCount, insuranceId);
    }

    /// @notice fetch insurance item by id
    /// @param _id of insurance
    function fetchInsurance(uint _id) public view returns (
        uint id, address investor, address client,
        uint duration, uint startTime, uint expireTime, uint status,
        uint investorPay, uint clientPay, address evaluator,  uint evaluatorStatus
    ) {
        id = insurances[_id].id;
        investor = insurances[_id].investor;
        client = insurances[_id].client;
        duration = insurances[_id].duration;
        startTime = insurances[_id].startTime;
        expireTime = insurances[_id].expireTime;
        status = uint(insurances[_id].status);
        investorPay = insurances[_id].investorPay;
        clientPay = insurances[_id].clientPay;
        evaluator = insurances[_id].evaluator;
        evaluatorStatus = uint(insurances[_id].evaluatorStatus);
        return (id, investor, client, duration, startTime, expireTime, status, investorPay, clientPay, evaluator, evaluatorStatus);
    }

  function fetchInvestsIdOfUser() public view returns (uint[100] memory ) {
    return userInsurancesAsInvestor[msg.sender] ;
  }

  function fetchInsurancesIdOfUser() public view returns (uint[100] memory ) {
    return userInsurancesAsClient[msg.sender] ;
  }


}
