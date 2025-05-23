import { Component, inject } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class SignupPageComponent {
  profileForm = new FormGroup({
    fname: new FormControl('', [Validators.required, Validators.pattern('[A-Za-z]+')]),
    lname: new FormControl('', [Validators.required, Validators.pattern('[A-Za-z]+')]),
    age: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(18)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  });

  get fname() {
    return this.profileForm.get('fname');
  }

  get lname() {
    return this.profileForm.get('lname');
  }

  get age() {
    return this.profileForm.get('age');
  }

  get email() {
    return this.profileForm.get('email');
  }

  get password() {
    return this.profileForm.get('password');
  }

  get confirmPassword() {
    return this.profileForm.get('confirmPassword');
  }

  userService = inject(UserService);
  user$ = this.userService.user$;

  doSignUp() {
    // Do signup
    if(!this.userService.signUp(this.email?.value, this.password?.value, this.confirmPassword?.value)) {
      return false
    }

    // Use our new user to initialize their database entry


    return false;
  }
}
