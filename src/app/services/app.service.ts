import { Injectable } from '@angular/core';
const Web3 = require('web3');

declare let require: any;
declare let window: any;
const contract = require('@truffle/contract');
const adminAbi = require('../../../build/contracts/Admin.json');
const insuranceAbi = require('../../../build/contracts/P2pInsurance.json');

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private account: any = null;
  private readonly web3: any;
  private enable: any;
  adminContract = contract(adminAbi);
  insuranceContract = contract(insuranceAbi);
  BN ;
  constructor() {
    if (window.ethereum === undefined) {
      alert('Non-Ethereum browser detected. Install MetaMask');
    } else {
      if (typeof window.web3 !== 'undefined') {
        this.web3 = window.web3.currentProvider;
      } else {
        this.web3 = new Web3.providers.HttpProvider('http://localhost:8545');
      }
      console.log('transfer.service :: constructor :: window.ethereum');
      window.web3 = new Web3(window.ethereum);
      console.log('transfer.service :: constructor :: this.web3');
      console.log(this.web3);
      this.enable = this.enableMetaMaskAccount();
    }
    this.adminContract.setProvider(this.web3);
    this.insuranceContract.setProvider(this.web3);
    this.BN = Web3.utils.BN;
  }

  private async enableMetaMaskAccount(): Promise<any> {
    let enable = false;
    await new Promise((resolve, reject) => {
      enable = window.ethereum.enable();
    });
    return Promise.resolve(enable);
  }

  private async getAccount(): Promise<any> {
    console.log('transfer.service :: getAccount :: start');
    if (this.account == null) {
      this.account = await new Promise((resolve, reject) => {
        console.log('transfer.service :: getAccount :: eth');
        console.log(window.web3.eth);
        window.web3.eth.getAccounts((err, retAccount) => {
          console.log('transfer.service :: getAccount: retAccount');
          console.log(retAccount);
          if (retAccount.length > 0) {
            this.account = retAccount[0];
            resolve(this.account);
          } else {
            alert('transfer.service :: getAccount :: no accounts found.');
            reject('No accounts found.');
          }
          if (err != null) {
            alert('transfer.service :: getAccount :: error retrieving account');
            reject('Error retrieving account');
          }
        });
      }) as Promise<any>;
    }
    return Promise.resolve(this.account);
  }
  public async getUserBalance(): Promise<any> {
    const account = await this.getAccount();
    console.log('transfer.service :: getUserBalance :: account');
    console.log(account);
    return new Promise((resolve, reject) => {
      window.web3.eth.getBalance(account, (err, balance) => {
        console.log('transfer.service :: getUserBalance :: getBalance');
        console.log(balance);
        if (!err) {
          const retVal = {
            account,
            balance
          };
          console.log('transfer.service :: getUserBalance :: getBalance :: retVal');
          console.log(retVal);
          resolve(retVal);
        } else {
          reject({account: 'error', balance: 0});
        }
      });
    }) as Promise<any>;
  }

  // admin contract
  // tslint:disable-next-line:typedef
  stopContract() {
    const that = this;
    return new Promise((resolve, reject) => {
      this.adminContract.deployed().then(instance => instance.stopContract({from: that.account}))
        .then(status => {
        if (status) {
          return resolve('contract stopped successfully');
        }
      }).catch(error => {
        console.log(error);
        return reject('stopContract error' + error);
      });
    });
  }

  startContract = () => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.adminContract.deployed().then(instance => instance.startContract({from: that.account}))
        .then(status => {
          if (status) {
            return resolve('contract started successfully');
          }
        }).catch(error => {
        console.log('start Contract got error: ', error);
        return reject('startContract error' + error);
      });
    });
  }

  // tslint:disable-next-line:typedef
  addEvaluator(newEvaluator) {
    const that = this;
    return new Promise((resolve, reject) => {
      console.log('account: ', that.account);
      this.adminContract.deployed().then(instance => instance.addNewEvaluator(
        newEvaluator,
        {
          from: that.account
        })).then(status => {
          console.log('status: ', status);
          if (status) {
          return resolve('evaluator added successfully');
        }
      }).catch(error => {
        console.log('evaluator error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  fetchRecentAddedEvaluators = () => {
    const that = this;
    return new Promise((resolve, reject) => {
      // console.log("account: ", that.account);
      this.adminContract.deployed().then(instance => instance.fetchRecentlyAddedEvaluators.call(
        {
          from: that.account
        })).then(status => {
        console.log('fetch status: ', status);
        if (status) {
          return resolve(JSON.stringify(status));
        }
      }).catch(error => {
        console.log('fetch evaluator error: ', error);
        return reject({status: false});
      });
    });
  }

  fetchStatusOfContract = () => {
    const that = this;
    return new Promise((resolve, reject) => {
      // console.log("account: ", that.account);
      this.adminContract.deployed().then(instance => instance.stopped.call(
        {
          from: that.account
        })).then(status => {
        // console.log('contrace status: ', status);
        if (status) {
          return resolve(JSON.stringify(status));
        }
      }).catch(error => {
        console.log('fetch contract status error: ', error);
        return reject({status: false});
      });
    });
  }
  // p2pInsuranceContract
  fetchNumberOfEnrolledUsers = () => {
    const that = this;
    return new Promise((resolve, reject) => {
      // console.log("account: ", that.account);
      this.insuranceContract.deployed().then(instance => instance.usersCount.call(
        {
          from: that.account
        })).then(status => {
        console.log('fetch usersCount status: ', status);
        if (status) {
          return resolve(new this.BN(status));
        }
      }).catch(error => {
        console.log('fetch usersCount error: ', error);
        return reject({status: false});
      });
    });
  }

  fetchNumberOfInsurances = () => {
    const that = this;
    return new Promise((resolve, reject) => {
      // console.log("account: ", that.account);
      this.insuranceContract.deployed().then(instance => instance.insuranceCount.call(
        {
          from: that.account
        })).then(status => {
        console.log('fetch insuranceCount status: ', status);
        if (status) {
          return resolve(new this.BN(status));
        }
      }).catch(error => {
        console.log('fetch insuranceCount error: ', error);
        return reject({status: false});
      });
    });
  }

  addNewRequest = (duration, payAmount) => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.addNewRequest(
        duration, payAmount,
        {
          from: that.account, value: payAmount
        })).then(status => {
        console.log('status: ', status);
        if (status) {
          return resolve('new Request added successfully');
        }
      }).catch(error => {
        console.log('new Req error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  acceptRequest = (id, amount) => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.acceptARequestByInvestor(
        id,
        {
          from: that.account, value: amount
        })).then(status => {
        console.log('status: ', status);
        if (status) {
          return resolve('Request accepted successfully');
        }
      }).catch(error => {
        console.log('accept req error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  requestForEvaluation = (id) => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.requestEvaluator(
        id,
        {
          from: that.account
        })).then(status => {
        console.log('status: ', status);
        if (status) {
          return resolve('evaluator set successfully');
        }
      }).catch(error => {
        console.log('evaluator req error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  refundToClient = (id) => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.refundToClient(
        id,
        {
          from: that.account
        })).then(status => {
        console.log('status: ', status);
        if (status) {
          return resolve('refunded to client successfully');
        }
      }).catch(error => {
        console.log('refunded to client error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  refundToInvestor = (id) => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.refundToInvestor(
        id,
        {
          from: that.account
        })).then(status => {
        console.log('status: ', status);
        if (status) {
          return resolve('refunded to investor successfully');
        }
      }).catch(error => {
        console.log('refundToInvestor error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  fetchUser = () => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.fetchUser.call(
        that.account,
        {
          from: that.account,
        })).then(status => {
        console.log('status: ', status);
        if (status) {
          return resolve(status);
        }
      }).catch(error => {
        console.log('fetch user error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  fetchInsurance = (id) => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.fetchInsurance.call(
        id,
        {
          from: that.account,
        })).then(status => {
        // console.log('insurance: ', status);
        if (status) {
          return resolve(status);
        }
      }).catch(error => {
        console.log('fetch insurance error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  fetchInvestsIdsOfUser = () => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.fetchInvestsIdOfUser.call(
        {
          from: that.account,
        })).then(status => {
        console.log('invest array: ', status);
        if (status) {
          return resolve(status);
        }
      }).catch(error => {
        console.log('fetch invest list error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  fetchInsuranceIdsOfUser = () => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.fetchInsurancesIdOfUser.call(
        {
          from: that.account,
        })).then(status => {
        console.log('insurance array: ', status);
        if (status) {
          return resolve(status);
        }
      }).catch(error => {
        console.log('fetch insurance ids list error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  // in normal mode
  withdrawCustomAmount = (amount) => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.withdrawCustomAmount(
        amount,
        {
          from: that.account
        })).then(status => {
        console.log('status: ', status);
        if (status) {
          return resolve('withdrawed successfully');
        }
      }).catch(error => {
        console.log('withdraw req error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }

  // in emergency mode
  withdraw = () => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.withdraw(
        {
          from: that.account
        })).then(status => {
        console.log('status: ', status);
        if (status) {
          return resolve('withdrawed successfully');
        }
      }).catch(error => {
        console.log('withdraw req error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }
  checkIfIsExpired = (id) => {
    const that = this;
    return new Promise((resolve, reject) => {
      this.insuranceContract.deployed().then(instance => instance.checkIfIsExpired( id,
        {
          from: that.account
        })).then(status => {
        console.log('expire status: ', status);
        if (status) {
          return resolve(status);
        }
      }).catch(error => {
        console.log('check expire req error: ', error);
        return reject(JSON.stringify(error.reason));
      });
    });
  }
}
