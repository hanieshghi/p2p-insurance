// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract Admin {

  address owner;
  mapping(address => bool) public validEvaluators;
  mapping(uint => address) public evaluators;
  uint public counter;
  bool public stopped = false;
  uint availableEvaluator;

  event LogStoppedChanged(bool indexed stopped);
  event LogEvaluatorAdded(address indexed evaluator);
  event LogEvaluatorRemoved(address indexed evaluator);
  event LogAvailableEvaluatorChanged(uint evaluator);

  modifier stopInEmergency { require(!stopped); _; }
  modifier onlyInEmergency { require(stopped); _; }

  modifier isOwner(){
      require(msg.sender == owner);
      _;
  }
  modifier isEvaluator(){
      require(validEvaluators[msg.sender]);
      _;
  }
  constructor() public {
    owner = msg.sender;
    counter = 1;

    evaluators[0] = msg.sender;
    validEvaluators[msg.sender] = true;
  }

  function stopContract() public isOwner stopInEmergency returns ( bool){
    stopped = true;
    emit LogStoppedChanged(stopped);
    return stopped;
  }

  function startContract() public isOwner onlyInEmergency returns ( bool){
    stopped = false;
    emit LogStoppedChanged(stopped);
    return stopped;
  }

  function addNewEvaluator(address payable _evaluator) public isOwner returns ( bool){
    require(!validEvaluators[_evaluator]);
    evaluators[counter] = _evaluator;
    counter += 1;
    validEvaluators[_evaluator] = true;
    emit LogEvaluatorAdded(_evaluator);
    return true;
  }

  // function removeEvaluator(address _evaluator) public isOwner returns ( bool){
  //   validEvaluators[_evaluator] = false;
  //   emit LogEvaluatorRemoved(_evaluator);
  //   return true;
  // }

  function changeAvailableEvaluator(uint lastAvailableEvaluator) internal returns ( uint){
    availableEvaluator = lastAvailableEvaluator+1;
    if(availableEvaluator >= counter){
      availableEvaluator = 0;
    }
    emit LogAvailableEvaluatorChanged(availableEvaluator);
    return availableEvaluator;
  }

  function fetchRecentlyAddedEvaluators() public view returns(address[5] memory) {
    address[5] memory recentEvaluators;
    for(uint i=0; i<5; i++){
      if(counter -1 - i < 0){
        recentEvaluators[i] = address(0);
      }else{
        recentEvaluators[i] = evaluators[counter-1-i];
      }
    }
    return recentEvaluators;
  }
}
