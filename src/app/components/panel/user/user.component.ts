import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user;
  pass;
  list = [];

  constructor() {
  }

  ngOnInit(): void {
    this.getList();
  }

  submit() {
    const obj = {
      username: this.user,
      password: this.pass
    };
    console.log(obj);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this imaginary file!',
      icon: 'success',
    });
  }

  getList() {
    // this.list = response;
  }

}
