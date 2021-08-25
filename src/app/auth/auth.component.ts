import { Component, forwardRef, Inject, NgZone, OnInit } from '@angular/core';
import { AmplifyService } from 'aws-amplify-angular';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import * as myVariables from '../variables' 

//@Injectable()
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  

  constructor(@Inject(forwardRef(() => AmplifyService)) public amplifyService: AmplifyService,  public _router: Router, private zone: NgZone) {
   
    this.amplifyService = amplifyService;
    this.amplifyService.authStateChange$
      .subscribe(authState => {
        if (authState.state === 'signedIn') {
          this.nav();
        }
      });
}

nav() {
  this.zone.run(() => this._router.navigate(['blogpage']))
    .then(() => {
      window.location.reload();
    })
}

goToHome() {
  this._router.navigate(['home']);
}

  ngOnInit(): void {}
}



