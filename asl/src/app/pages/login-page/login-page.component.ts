import { Component, inject } from '@angular/core';
import {RouterModule, Router } from '@angular/router';
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
export class LoginPageComponent {
  profileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
  loginFailed = false;
  userService = inject(UserService);
  router: Router = inject(Router);
  user$ = this.userService.user$;

  goToSignUp() {
    this.router.navigate(['/', 'signup'])
  }

  async doLogin() {
    await this.userService.login(this.profileForm.value.email, this.profileForm.value.password)
    if(this.userService.currentUser == null) {
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
