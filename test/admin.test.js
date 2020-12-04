let Admin = artifacts.require('Admin')
let catchRevert = require("./exceptionsHelpers.js").catchRevert

contract('Admin', function(accounts) {

    const owner = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    let instance

    beforeEach(async () => {
        instance = await Admin.new()
    })

    it("should turn stopped to true", async() => {
        const tx = await instance.stopContract( {from: owner})

        const result = await instance.stopped.call()

        assert.equal(result, true, 'the stopped variable should be true')
    })

    it("should emit a LogStoppedChanged event when an stopped is set to true", async()=> {
        let eventEmitted = false
        const tx = await instance.stopContract({from: owner})
        if (tx.logs[0].event == "LogStoppedChanged") {
            eventEmitted = true
        }

        assert.equal(eventEmitted, true, 'changing stopped should emit a LogStoppedChanged event')
    })

    it("should turn stopped to false", async() => {
      await instance.stopContract( {from: owner})
        const tx = await instance.startContract( {from: owner})

        const result = await instance.stopped.call()

        assert.equal(result, false, 'the stopped variable should be false')
    })

    it("should emit a LogStoppedChanged event when  stopped is set to false", async()=> {
        let eventEmitted = false
      await instance.stopContract( {from: owner})
        const tx = await instance.startContract({from: owner})
        // console.log(tx);
        if (tx.logs[0].event == "LogStoppedChanged") {
            eventEmitted = true
        }

        assert.equal(eventEmitted, true, 'changing stopped should emit a LogStoppedChanged event')
    })

    it("should error when someone that is not owner tries to set stopped true", async()=>{
        await catchRevert( instance.stopContract({from: alice}))
    })

    it("should error when not someone that is not owner tries to set stopped false", async()=>{
        await catchRevert( instance.startContract({from: alice}))
    })

    it("should add new evaluator", async()=>{

        const tx = await instance.addNewEvaluator(alice, {from: owner})
        const result = await instance.fetchEvaluatorById.call(1)
        const result2 = await instance.fetchStatusOfEvaluatorById.call(alice)
        assert.equal(result, alice, 'adding an evaluator should save address in evaluators')
        assert.equal(result2, true, 'adding an evaluator should validate the evaluator')
    })

    it("should revert when someone that is not the owner tries to call addNewEvaluator()", async()=>{
        await catchRevert( instance.addNewEvaluator(bob, {from: alice}))
    })


})
