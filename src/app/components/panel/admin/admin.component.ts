import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';
import {AppService} from '../../../services/app.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  test = 'emad';

  constructor(
    private appService: AppService,
  ) {
    // this.onReady();
  }


  ngOnInit(): void {
  }

  stop() {
    // Swal.fire({
    //   title: 'Are you sure?',
    //   text: 'You will not be able to recover this imaginary file!',
    //   icon: 'success',
    // });
    this.appService.stopContract().then(res => {
      Swal.fire('ok');
    }).catch(e => {
      Swal.fire('error', e);
    });
  }

}

