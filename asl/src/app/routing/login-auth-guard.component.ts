import { inject, Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from '../services/user.service';


@Injectable({
  providedIn: 'root'
})
export class LoginAuthGuard implements CanActivate {
  userService: UserService = inject(UserService);
  constructor(private router: Router) {}
  canActivate(): Promise<boolean> | boolean {
    return this.authorize();
  }

  authorize(): Promise<boolean> {
    console.log("Checking auth");
    return new Promise((resolve) => {
      if(this.userService.isAnonLoggedIn() || !this.userService.currentUser) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
  }
}
