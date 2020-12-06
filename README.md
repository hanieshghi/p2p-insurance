# Basic P2P Insurance Project based on Ethereum network

In this project we have 3 roles: #Client, #Investor and #Owner

* every Address except owner can be client and investor. 
* For example Alice Requests a new Insurance for 5days and pays 1 ether. (now the Investor must pay 20 Ether for accept this request)
* Bob sees Alice request on his panel and accepts Alice Request and pays 20 Ether. 
* if Alice have an accident, she requests for evaluation. 
* evaluator decides that Alice should be refunded or not. if evaluator says that Alice must get payed, 20 ether goes to Alice Wallet.


for running the project:

1. be sure to have npm and Metamask (extention for Chrome) installed.
2. install truffle@5.1.52 with this command: 
```sudo npm install -g truffle@5.1.52```
3. install angular cli: 
```npm install -g @angular/cli```
4. install open: 
```npm install @openzeppelin/contracts```
5. and in the root of project: ```npm install```
6. in the root of project: ```ng serve``` 
now the project is up on localhost:4200 but before that we need to connect to a network. it can be local network or Ropsten.

for connect to a local network for test purposes you can use ganache or truffle develop and change the network on Metamask properly.

in this tutorial I use truffle develop:
 - in the root of project run: 
 1. ```truffle develop```
 2. ```truffle compile```
 3. ```truffle migrate ```  (for Ropsten run ```truffle migrate --network ropsten ```)
 
 now you can use the project on localhost:4200
 
 for running tests, run this command: 
 4. ```truffle test```
