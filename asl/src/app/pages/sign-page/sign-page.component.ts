import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
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
export class SignPageComponent implements OnInit {
  userService = inject(UserService);
  user$ = this.userService.user$;
  text = '';
  signedLetters = ''; // Store the history of signed letters

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  async ngOnInit() {
    try {
      // Request camera permissions when component initializes
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      // Once we have permissions, set up the video stream
      this.videoElement.nativeElement.srcObject = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
      // You might want to show an error message to the user here
    }
  }
}
