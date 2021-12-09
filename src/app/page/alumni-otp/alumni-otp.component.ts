import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { CommonModule } from '@angular/common';  
// import { BrowserModule } from '@angular/platform-browser';
export const TITLE = 'Alumni OTP';

@Component({
  selector: 'app-alumni-otp',
  templateUrl: './alumni-otp.component.html',
  styleUrls: ['./alumni-otp.component.css'],
})
export class OTPComponent implements OnInit {
  public authenticating = false;
  public error: number;
  public ldap: string;
  otpForm = this.formBuilder.group({
    otp: ''
  });
  constructor(
    public route: ActivatedRoute,
    public dataService: DataService,
    public snackBar: MatSnackBar,
    public router: Router,
    public formBuilder: FormBuilder,
  ) { }
  
  /** Initialize initial list wiht API call */
  ngOnInit() {
    this.dataService.setTitle('Alumni OTP');
    if (this.dataService.isLoggedIn()) {
      this.router.navigate(['feed']);
      return;
    }
    this.route.url.subscribe( value => {
      this.ldap = value[0].parameters['ldap'];
    });
  }  

  verifyOTP(): void {
    this.dataService.SendOTP(this.ldap, this.otpForm.value.otp).subscribe((status) => {
      if (status['error_status'] == false) {
        this.dataService.GetFillCurrentUser().subscribe(() => {
          const redir = localStorage.getItem(this.dataService.LOGIN_REDIR);
          if (redir && redir !== '') {
            localStorage.setItem(this.dataService.LOGIN_REDIR, '');
            const rpath: any[] = this.dataService.DecodeObject(redir);
            this.router.navigate(rpath);
          } else {
            this.router.navigate(['feed']);
          }
        });
      }
      else {
        this.snackBar.open(status['msg'], 'Dismiss', { duration: 2000 });
        if (status['msg'] == 'Wrong OTP, retry') {
          this.router.navigate(['alumni-otp', {ldap: this.ldap}]);
        }
        else {
          this.router.navigate(['alumni']);
        }
      }
    });
    this.otpForm.reset();
  }

  resendOTP(): void {
    this.dataService.ResendOTP(this.ldap).subscribe((status) => {
      if (status['error_status'] == false) {
        this.router.navigate(['alumni-otp', {ldap: this.ldap}])
      }
      else {
        this.snackBar.open(status['msg'], 'Dismiss', { duration: 2000 });
        this.router.navigate(['alumni'])
      }
    })
  }
}
