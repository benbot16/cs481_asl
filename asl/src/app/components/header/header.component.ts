import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [AsyncPipe],
})
export class HeaderComponent {
  userService = inject(UserService);
  user$ = this.userService.user$;
}
