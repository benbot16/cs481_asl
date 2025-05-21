import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sign-page',
  templateUrl: './sign-page.component.html',
  styleUrls: ['./sign-page.component.css'],
  standalone: true,
  imports: [AsyncPipe, FormsModule]
})
export class SignPageComponent {
  userService = inject(UserService);
  user$ = this.userService.user$;
  text = '';
}
