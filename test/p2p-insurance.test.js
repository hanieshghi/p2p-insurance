/*

The public version of the file used for testing can be found here: https://gist.github.com/ConsenSys-Academy/7d59ba6ebe581c1ffcc981469e226c6e

This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/
let BN = web3.utils.BN;
let P2pInsurance = artifacts.require('P2pInsurance');
let catchRevert = require("./exceptionsHelpers.js").catchRevert;

contract('P2pInsurance', function(accounts) {

    const owner = accounts[0];
    const client = accounts[1];
    const investor = accounts[2];
    const emptyAddress = '0x0000000000000000000000000000000000000000';

    const clientPay = "1000";
    const investorPay = "20000";
    const duration = "20";

    let instance;

    beforeEach(async () => {
        instance = await P2pInsurance.new()
    });

    it("should add new insurance request with the provided pay and duration and register user if the address is new", async() => {
        const tx = await instance.addNewRequest(duration, clientPay, {from: client, value: clientPay});
                
        const result = await instance.fetchInsurance.call(1);
        const user = await instance.fetchUser.call(client);

        assert.equal(result[2], client, 'the client address of the last added item does not match the expected value');
        assert.equal(result[3].toString(10), duration, 'the duration of the last added item does not match the expected value');
        assert.equal(result[6].toString(10), 0, 'the status of the item should be "INIT", which should be declared first in the Status Enum')
        assert.equal(result[8].toString(), clientPay, 'the clientPay of the last added item does not match the expected value');

        assert.equal(user[1], client, 'the address of the last added user does not match the expected value');
        assert.equal(user[3].toString(), clientPay, 'the lockedBalance of the last added user does not match the expected value');
        assert.equal(user[4].toString(), 0, 'the investsCount of the user does not match the expected value');
        assert.equal(user[5].toString(), 1, 'the insuranceId of the user does not match the expected value');

    });

    it("should error when not enough value is sent when add new request ", async()=>{
        await catchRevert(instance.addNewRequest(duration, clientPay, {from: client, value: 1}))
    })

    it("should emit a LogNewRequest event when an insurance is added", async()=> {
        let eventEmitted = false;
        const tx = await instance.addNewRequest(duration, clientPay, {from: client, value: clientPay});
        
        if (tx.logs[1].event == "LogNewRequest") {
            eventEmitted = true
        }

        assert.equal(eventEmitted, true, 'adding an request should emit a LogNewRequest event')
    });

    it("should allow someone to accept an request and update state accordingly", async() => {
        var investorBalanceBefore = await web3.eth.getBalance(investor);

        await instance.addNewRequest(duration, clientPay, {from: client, value: clientPay});


        await instance.acceptARequestByInvestor(1, {from: investor, value: investorPay});

        var clientBalanceAfter = await web3.eth.getBalance(client);
        var investorBalanceAfter = await web3.eth.getBalance(investor);

        const result = await instance.fetchInsurance.call(1);

        assert.equal(result[6].toString(10), 1, 'the status of the insurance should be "INPROCESS", which should be declared second in the State Enum')
        assert.equal(result[1], investor, 'the investor address should be set investor when he accepts an request')
        assert.isBelow(Number(investorBalanceAfter), Number(new BN(investorBalanceBefore).sub(new BN(investorPay))), "investor's balance should be reduced by more than the investorPay of the request (including gas costs)")
    })

    it("should error when not enough value is sent when accepting an item", async()=>{
        await instance.addNewRequest(duration, clientPay, {from: client, value: clientPay});
        await catchRevert(instance.acceptARequestByInvestor(0, {from: investor, value: 1}))
    })

    it("should emit LogInsuranceAcceptedByInvestor event when a request is accepted", async()=>{
        var eventEmitted = false

        await instance.addNewRequest(duration, clientPay, {from: client, value: clientPay});
        const tx = await instance.acceptARequestByInvestor(1, {from: investor, value: investorPay});

        if (tx.logs[1].event == "LogInsuranceAcceptedByInvestor") {
            eventEmitted = true
        }

        assert.equal(eventEmitted, true, 'accepting a request should emit a LogInsuranceAcceptedByInvestor event')
    });

    it("should revert when someone that is not the client tries to call requestEvaluator()", async()=>{
        await instance.addNewRequest(duration, clientPay, {from: client, value: clientPay});
        await instance.acceptARequestByInvestor(1, {from: investor, value: investorPay});
        await catchRevert(instance.requestEvaluator(1, {from: investor}))
    })

    it("should allow the client to request for evaluation", async() => {

        await instance.addNewRequest(duration, clientPay, {from: client, value: clientPay});
        await instance.acceptARequestByInvestor(1, {from: investor, value: investorPay});
        await instance.requestEvaluator(1, {from: client});
	
        const result = await instance.fetchInsurance.call(1);
        // assert.equal(tx, true, 'the evaluator should return true');
        assert.notEqual(result[9], emptyAddress, 'the evaluator Address should not be 0')
    })

    it("should emit a LogSetEvaluator event when client requested for evaluation", async() => {
        var eventEmitted = false

        await instance.addNewRequest(duration, clientPay, {from: client, value: clientPay});
        await instance.acceptARequestByInvestor(1, {from: investor, value: investorPay});
        const tx = await instance.requestEvaluator(1, {from: client});

        if (tx.logs[0].event == "LogSetEvaluator") {
            eventEmitted = true
        }

        assert.equal(eventEmitted, true, 'requesting for evaluation should emit a LogSetEvaluator event')
    })

    // it("should allow the buyer to mark the item as received", async() => {
    //     await instance.addItem(name, price, {from: client})
    //     await instance.buyItem(0, {from: investor, value: excessAmount})
    //     await instance.shipItem(0, {from: client})
    //     await instance.receiveItem(0, {from: investor})
	//
    //     const result = await instance.fetchItem.call(0)
    //
    //     assert.equal(result[3].toString(10), 3, 'the state of the item should be "Received", which should be declared fourth in the State Enum')
    // })
    //
    // it("should revert if an address other than the buyer calls receiveItem()", async() =>{
    //     await instance.addItem(name, price, {from: client})
    //     await instance.buyItem(0, {from: investor, value: excessAmount})
    //     await instance.shipItem(0, {from: client})
    //
    //     await catchRevert(instance.receiveItem(0, {from: client}))
    // })
    //
    // it("should emit a LogReceived event when an item is received", async() => {
    //     var eventEmitted = false
    //
    //     await instance.addItem(name, price, {from: client})
    //     await instance.buyItem(0, {from: investor, value: excessAmount})
    //     await instance.shipItem(0, {from: client})
    //     const tx = await instance.receiveItem(0, {from: investor})
    //
    //     if (tx.logs[0].event == "LogReceived") {
    //         eventEmitted = true
    //     }
    //
    //     assert.equal(eventEmitted, true, 'adding an item should emit a Shipped event')
    // })

})
