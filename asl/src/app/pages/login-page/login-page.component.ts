import { Component, inject } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  standalone: true,
})
export class LoginPageComponent {
  chatService = inject(UserService);
  user$ = this.chatService.user$;
}
