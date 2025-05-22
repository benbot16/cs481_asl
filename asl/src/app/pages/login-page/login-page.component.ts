import { Component, inject } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class LoginPageComponent {
  profileForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });
  loginFailed = false;
  userService = inject(UserService);
  user$ = this.userService.user$;

  doLogin() {
    if(!this.userService.login(this.profileForm.value.email, this.profileForm.value.password)) {
      this.loginFailed = true;
    }
  }

  doLoginGoogle() {
    this.userService.loginGoogle();
  }

  doLoginAnon() {
    this.userService.loginAnon()
  }
}
