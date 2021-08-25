import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as myVariables from '../variables'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private _router: Router) {}

   goToLogin() {
    this._router.navigate(['auth']);
  }

  goToGuest() {
    this._router.navigate(['blogpage']);
    myVariables.change(false);
  }

  ngOnInit(): void {
    //console.log(myVariables.jwt);
  }

}


