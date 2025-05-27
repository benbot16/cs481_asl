// Import necessary Angular modules and components
import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

// Component decorator with metadata
@Component({
  selector: 'app-sign-page', // HTML selector for this component
  templateUrl: './sign-page.component.html', // Path to HTML template
  styleUrls: ['./sign-page.component.css'], // Path to CSS styles
  standalone: true, // Indicates this is a standalone component (Angular 14+)
  imports: [AsyncPipe, FormsModule] // Required imports for template usage
})
export class SignPageComponent implements OnInit {
  // Inject the UserService for authentication and user data
  userService = inject(UserService);
  // Observable for user authentication state
  user$ = this.userService.user$;
  // Property for storing text input (currently unused but available)
  text = '';
  // Property to store recognized ASL letters as they are signed
  signedLetters = ''; // Store the history of signed letters

  // Reference to the video element in the template
  // The ! operator indicates this will be initialized after view init
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  // Lifecycle hook that runs when the component initializes
  async ngOnInit() {
    try {
      // Request camera permissions when component initializes
      // This is necessary for hand sign recognition
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true, // Enable video
        audio: false // Disable audio as it's not needed
      });

      // Once we have permissions, set up the video stream
      // Connect the stream to the video element in the DOM
      this.videoElement.nativeElement.srcObject = stream;
    } catch (err) {
      // Handle errors with camera access
      console.error('Error accessing camera:', err);
      // You might want to show an error message to the user here
      // For example, add a user-friendly error message to the UI
    }
  }

  // Note: This component currently only sets up the webcam feed
  // To implement ASL recognition, additional code would be needed to:
  // 1. Process video frames using a machine learning model
  // 2. Detect hand positions and gestures
  // 3. Map detected gestures to ASL letters
  // 4. Update the signedLetters property with recognized letters
}
