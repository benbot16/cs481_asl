import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [AsyncPipe],
})
export class HeaderComponent {
  userService = inject(UserService);
  router: Router = inject(Router);
  user$ = this.userService.user$;

  logout() {
    this.userService.logout();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
