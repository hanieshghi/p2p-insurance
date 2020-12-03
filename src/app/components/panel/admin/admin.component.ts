import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';
import {AppService} from '../../../services/app.service';
import {UserComponent} from '../user/user.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [AppService]
})
export class AdminComponent implements OnInit {
  // test = 'emad';
  account: any;
  accounts: any;
  totalInsurance = 0;
  totalUser = 0;
  evaluatorAddress: string;
  evaluatorsList = [];
  waitingList = [];
  contractStatus = true;
  constructor(
    private appService: AppService,
  ) {
    // this.onReady();
    this.getAccountAndBalance();
    this.fetchRecentEvaluators();
    this.fetchUsersCount();
    this.fetchInsuranceCount();
    this.fetchWaitingList();
    this.fetchStatusOfContract();
  }


  ngOnInit(): void {
  }

  fetchWaitingList = async () => {
    const max = await this.appService.fetchNumberOfInsurances();
    this.waitingList = [];
    for (let i = 1 ; i <= max; i++){
      this.appService.fetchInsurance(i).then((res: any ) => {
        if (res.status == 2){
          this.waitingList.push(res);
        }

      }).catch(e => {
        console.log('error:', e);
        // Swal.fire('error in fetch user insurance', e);
      });
    }
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

  stop = () => {
    // Swal.fire({
    //   title: 'Are you sure?',
    //   text: 'You will not be able to recover this imaginary file!',
    //   icon: 'success',
    // });
    this.appService.stopContract().then(res => {
      this.fetchStatusOfContract();
      Swal.fire('ok');
    }).catch(e => {
      Swal.fire('error', e);
    });
  }

  start = () => {
    this.appService.startContract().then(res => {
      this.fetchStatusOfContract();
      Swal.fire('ok');
    }).catch(e => {
      Swal.fire('error', e);
    });
  }

  // tslint:disable-next-line:typedef
  addEvaluator(){
    console.log('address: ', this.evaluatorAddress);
    this.appService.addEvaluator(this.evaluatorAddress).then(res => {
      Swal.fire(JSON.stringify(res));
      this.fetchRecentEvaluators();
    }).catch(e => {
      Swal.fire('error', e);
    });
  }

  fetchRecentEvaluators = () => {
    this.appService.fetchRecentAddedEvaluators().then(res => {
      // @ts-ignore
      this.evaluatorsList = JSON.parse(res);
      console.log('list of evals: ', res);
    }).catch(e => {
      console.log('fetch error', e);
    });
  }

  fetchUsersCount = () => {
    this.appService.fetchNumberOfEnrolledUsers().then(res => {
      // @ts-ignore
      this.totalUser = Number(res);
      console.log('totalUser: ', res);
    }).catch(e => {
      console.log('fetch totalUser error', e);
    });
  }

  fetchInsuranceCount = () => {
    this.appService.fetchNumberOfInsurances().then(res => {
      // @ts-ignore
      this.totalInsurance = Number(res) ;
      console.log('totalInsurance: ', res);
    }).catch(e => {
      console.log('fetch totalInsurance error', e);
    });
  }

  fetchStatusOfContract = () => {
    this.appService.fetchStatusOfContract().then((res: boolean) => {
      this.contractStatus = res;
    }).catch(e => {
      console.log('fetch totalInsurance error', e);
    });
  }

  refundToClient = (id) => {
    this.appService.refundToClient(id ).then(res => {
      Swal.fire(JSON.stringify(res));
      this.fetchWaitingList();
      // }
    }).catch(e => {
      Swal.fire('error', e);
    });
  }

  refundToInvestor = (id) => {
    this.appService.refundToInvestor(id ).then(res => {
      Swal.fire(JSON.stringify(res));
      this.fetchWaitingList();
      // }
    }).catch(e => {
      Swal.fire('error', e);
    });
  }

}

