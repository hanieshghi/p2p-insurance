import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';
import {AppService} from '../../../services/app.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [AppService]
})
export class UserComponent implements OnInit {
  account: any;
  accounts: any;
  usableBalance;
  lockedBalance;
  insuranceId;
  duration;
  clientPay;
  initList = [];
  processList = [];
  finishList = [];
  waitingList = [];
  // @ts-ignore
  currentUserInsurance: {
    id,
    investor,
    client,
    duration,
    startTime,
    expireTime,
    status,
    investorPay,
    clientPay,
    evaluator,
    evaluatorStatus,
  } = {};

  constructor(
    private appService: AppService,
  ) {
    this.getAccountAndBalance();
    this.fetchUser();
    this.fetchInsurances();
  }

  ngOnInit(): void {
  }

  getAccountAndBalance = () => {
    const that = this;
    this.appService.getUserBalance().
    then((retAccount: any) => {
      this.account = retAccount.account;
      // that.user.balance = retAccount.balance;
      console.log('account: ', that.account, retAccount.balance);
    }).catch(error => {
      console.log(error);
    });
  }


  fetchUser = () => {
    this.appService.fetchUser().then(res => {
      // Swal.fire(JSON.stringify(res));
      console.log('res', res);
      // @ts-ignore
      this.usableBalance = res.usableBalance;
      // @ts-ignore
      this.lockedBalance = res.lockedBalance;
      // @ts-ignore
      this.insuranceId = res.insuranceId;
      // if(this.insuranceId !== '0'){
      this.fetchUserInsurance();
      // }
    }).catch(e => {
      Swal.fire('error in fetch userInfo', e);
    });
  }

  fetchUserInsurance = () => {
    this.appService.fetchInsurance(this.insuranceId).then(res => {
      // Swal.fire(JSON.stringify(res));
      console.log('response', res);
      // @ts-ignore
      this.currentUserInsurance.id = res.id;
      // @ts-ignore
      this.currentUserInsurance.investor = res.investor;
      // @ts-ignore
      this.currentUserInsurance.startTime = new Date(res.startTime * 1000);
      // @ts-ignore
      this.currentUserInsurance.duration = res.duration;
      // @ts-ignore
      this.currentUserInsurance.expireTime = new Date(res.expireTime * 1000);
      // @ts-ignore
      this.currentUserInsurance.clientPay = res.clientPay;
      // @ts-ignore
      this.currentUserInsurance.investorPay = res.investorPay;
      // @ts-ignore
      this.currentUserInsurance.status = res.status;
      // @ts-ignore
      this.currentUserInsurance.evaluator = res.evaluator;
      // @ts-ignore
      this.currentUserInsurance.evaluatorStatus = res.evaluatorStatus;


    }).catch(e => {
      console.log('errror:', e);
      Swal.fire('error in fetch user insurance', e);
    });
  }

  addRequest = () => {
    this.appService.addNewRequest(this.duration, this.clientPay).then(res => {
      Swal.fire(JSON.stringify(res));
      this.fetchUser();
      this.fetchUserInsurance();
      // }
    }).catch(e => {
      Swal.fire('error in add new Req', e);
    });
  }

  acceptRequest = (id, amount) => {
    this.appService.acceptRequest(id , amount).then(res => {
      Swal.fire(JSON.stringify(res));
      this.fetchInsurances();
      // }
    }).catch(e => {
      Swal.fire('error in accept new Req', e);
    });
  }

  requestEvaluator = (id) => {
    this.appService.requestForEvaluation(id ).then(res => {
      Swal.fire(JSON.stringify(res));
      this.fetchUser();
      // }
    }).catch(e => {
      Swal.fire('error', e);
    });
  }

  refundToClient = (id) => {
    this.appService.refundToClient(id ).then(res => {
      Swal.fire(JSON.stringify(res));
      this.fetchInsurances();
      // }
    }).catch(e => {
      Swal.fire('error', e);
    });
  }

  refundToInvestor = (id) => {
    this.appService.refundToInvestor(id ).then(res => {
      Swal.fire(JSON.stringify(res));
      this.fetchInsurances();
      // }
    }).catch(e => {
      Swal.fire('error', e);
    });
  }

  // tslint:disable-next-line:typedef
  async fetchInsurances(){
    const max = await this.appService.fetchNumberOfInsurances();
    for (let i = 1 ; i <= max; i++){
      this.appService.fetchInsurance(i).then(res => {
          if(res.status == 0){
            this.initList.push(res);
          }
        else if(res.status == 1){
          this.processList.push(res);
        }
          else if(res.status == 2){
            this.waitingList.push(res);
          }
        else if(res.status == 3){
          this.finishList.push(res);
        }

      }).catch(e => {
        console.log('error:', e);
        // Swal.fire('error in fetch user insurance', e);
      });
    }
  }
}
