import { Component, inject } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule, Validators} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class SSSSSSSSSignupPageComponent {
  profileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
  loginFailed = false;
  userService = inject(UserService);
  user$ = this.userService.user$;

  doSignUp() {
    if(!this.userService.login(this.profileForm.value.email, this.profileForm.value.password)) {
      this.loginFailed = true;
    }
  }
}
