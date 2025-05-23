import { Component, inject } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule, Validators} from '@angular/forms';
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
    fname: new FormControl('', Validators.required),
    lname: new FormControl('', Validators.required),
    age: new FormControl('', [Validators.required, Validators.pattern('/^[0-9]+$/')]),
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
    // Backup check
    if(this.profileForm.value.password != this.profileForm.value.confirmPassword) {
      return false;
    }
    return false;
  }
}
