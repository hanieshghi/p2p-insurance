/*

The public version of the file used for testing can be found here: https://gist.github.com/ConsenSys-Academy/7d59ba6ebe581c1ffcc981469e226c6e

This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/
let BN = web3.utils.BN
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
        const tx = await instance.startContract( {from: owner})
                
        const result = await instance.stopped.call()

        assert.equal(result, false, 'the stopped variable should be false')
    })

    it("should emit a LogStoppedChanged event when an stopped is set to false", async()=> {
        let eventEmitted = false
        const tx = await instance.startContract({from: owner})
        
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
        const result = await instance.evaluators.call(0)
        const result2 = await instance.validEvaluators.call(alice)
        assert.equal(result, alice, 'adding an evaluator should save address in evaluators')
        assert.equal(result2, true, 'adding an evaluator should validate the evaluator')
    })

    it("should revert when someone that is not the owner tries to call addNewEvaluator()", async()=>{
        await catchRevert( instance.addNewEvaluator(bob, {from: alice}))
    })

    // it("should allow the seller to mark the item as shipped", async() => {

    //     await instance.addItem(name, price, {from: alice})
    //     await instance.buyItem(0, {from: bob, value: excessAmount})
    //     await instance.shipItem(0, {from: alice})
	
    //     const result = await instance.fetchItem.call(0)

    //     assert.equal(result[3].toString(10), 2, 'the state of the item should be "Shipped", which should be declared third in the State Enum')
    // })

    // it("should emit a LogShipped event when an item is shipped", async() => {
    //     var eventEmitted = false

    //     await instance.addItem(name, price, {from: alice})
    //     await instance.buyItem(0, {from: bob, value: excessAmount})
    //     const tx = await instance.shipItem(0, {from: alice})

    //     if (tx.logs[0].event == "LogShipped") {
    //         eventEmitted = true
    //     }

    //     assert.equal(eventEmitted, true, 'adding an item should emit a Shipped event')
    // })

    // it("should allow the buyer to mark the item as received", async() => {
    //     await instance.addItem(name, price, {from: alice})
    //     await instance.buyItem(0, {from: bob, value: excessAmount})
    //     await instance.shipItem(0, {from: alice})
    //     await instance.receiveItem(0, {from: bob})
	
    //     const result = await instance.fetchItem.call(0)

    //     assert.equal(result[3].toString(10), 3, 'the state of the item should be "Received", which should be declared fourth in the State Enum')
    // })

    // it("should revert if an address other than the buyer calls receiveItem()", async() =>{
    //     await instance.addItem(name, price, {from: alice})
    //     await instance.buyItem(0, {from: bob, value: excessAmount})
    //     await instance.shipItem(0, {from: alice})
        
    //     await catchRevert(instance.receiveItem(0, {from: alice}))
    // })

    // it("should emit a LogReceived event when an item is received", async() => {
    //     var eventEmitted = false

    //     await instance.addItem(name, price, {from: alice})
    //     await instance.buyItem(0, {from: bob, value: excessAmount})
    //     await instance.shipItem(0, {from: alice})
    //     const tx = await instance.receiveItem(0, {from: bob})
        
    //     if (tx.logs[0].event == "LogReceived") {
    //         eventEmitted = true
    //     }

    //     assert.equal(eventEmitted, true, 'adding an item should emit a Shipped event')
    // })

})
