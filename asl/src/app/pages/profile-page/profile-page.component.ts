import { Component, inject } from '@angular/core';
import {RouterModule, Router } from '@angular/router';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule, Validators} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class ProfilePageComponent {
  profileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
  loginFailed = false;
  userService = inject(UserService);
  router: Router = inject(Router);
  user$ = this.userService.user$;

  modifyProfile() {

  }
}
