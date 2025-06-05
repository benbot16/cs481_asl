// Import necessary Angular modules and components
import { AsyncPipe, NgIf, NgClass, NgFor } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

// Import TensorFlow.js
import * as tf from '@tensorflow/tfjs';

// Import MediaPipe Hands and Camera utilities
// Note: We need to declare these as any since they don't have TypeScript types
declare const Hands: any;
declare const Camera: any;

// Component decorator with metadata
@Component({
  selector: 'app-sign-page', // HTML selector for this component
  templateUrl: './sign-page.component.html', // Path to HTML template
  styleUrls: ['./sign-page.component.css'], // Path to CSS styles
  standalone: true, // Indicates this is a standalone component (Angular 14+)
  imports: [AsyncPipe, FormsModule, NgIf, NgClass, NgFor] // Required imports for template usage
})
export class SignPageComponent implements OnInit, AfterViewInit, OnDestroy {
  // Inject the UserService for authentication and user data
  userService = inject(UserService);
  // Observable for user authentication state
  user$ = this.userService.user$;
  // Property for storing text input (currently unused but available)
  text = '';
  // Property to store recognized ASL letters
  signedLetters = '';
  // Property to store letter history
  letterHistory: string[] = [];
  // Property to store the parsed sentence
  parsedSentence = '';
  // Property to track if we're actively collecting letters
  isCollectingLetters = false;
  // Property to store saved sentences
  savedSentences: string[] = [];
  // Storage key for localStorage - use a simple key name to avoid issues
  private readonly STORAGE_KEY = 'asl_sentences';
  // Data version key for localStorage - used for DB purposes
  private readonly VERSION_KEY = 'asl_storage_version'
  // Property to control saved sentences modal visibility
  showSavedSentences = false;
  // Property to track number of saved sentences
  savedSentencesCount = 0;
  // Property for notification display
  showNotification = false;
  // Property for notification message
  notificationMessage = '';
  // Previous letter detected
  private previousLetter = '';

  // References to DOM elements
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('outputText') outputText!: ElementRef<HTMLDivElement>;

  // MediaPipe and TensorFlow.js objects
  private hands: any;
  private camera: any;
  private customModel: any;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  // Lifecycle hook that runs when the component initializes
  async ngOnInit() {
    console.log('Sign page component initializing');

    // Load saved sentences first thing to ensure they're available
    this.initializeSavedSentences();

    // Initialize model and tracking after sentences are loaded
    try {
      // Load required scripts dynamically
      await this.loadScripts();

      // Initialize MediaPipe Hands
      this.initializeHandTracking();

      // Load the custom TensorFlow.js model
      this.loadModel();
    } catch (error) {
      console.error('Error initializing component:', error);
    }

    // Double-check sentences loaded correctly
    console.log(`Initialization complete. Saved sentences: ${this.savedSentences.length}`);
  }

  // Initialize saved sentences from localStorage
  private initializeSavedSentences(): void {
    try {
      // Try to get data from localStorage
      console.log("Loading data...")
      var savedData = localStorage.getItem(this.STORAGE_KEY);
      var storageNum: number = parseInt(localStorage.getItem(this.VERSION_KEY)?localStorage.getItem(this.VERSION_KEY)!!:"0"!!);
      if(!storageNum) {
        storageNum = 0;
      }

      try {
        var remoteNum = 0;
        this.userService.getSavedVersion().then((result) => {
          remoteNum = result;
        });
        if(storageNum < remoteNum) {
          this.userService.getSavedData().then((result) => {
            savedData = result;
          });
        }
      } catch(error) {
        console.log("Firebase data retrieval error: ", error)
      }

      // Create some test data if needed for testing
      // localStorage.setItem(this.STORAGE_KEY, JSON.stringify(['Hello world', 'This is a test', 'ASL is fun']));

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) {
            // Creating a new array reference is important for Angular's change detection
            this.savedSentences = [...parsed];
            this.savedSentencesCount = this.savedSentences.length;
            console.log(`Loaded ${this.savedSentences.length} saved sentences`);
          } else {
            // Reset if not an array
            this.savedSentences = [];
            this.savedSentencesCount = 0;
          }
        } catch (parseError) {
          // Handle JSON parsing errors
          console.error('Invalid saved sentences data:', parseError);
          this.savedSentences = [];
          this.savedSentencesCount = 0;
        }
      } else {
        // No data found
        this.savedSentences = [];
        this.savedSentencesCount = 0;
      }
    } catch (error) {
      // Handle any other errors
      console.error('Error loading saved sentences:', error);
      this.savedSentences = [];
      this.savedSentencesCount = 0;
    }
  }

  // After the view is initialized, set up the canvas
  ngAfterViewInit() {
    // Get the canvas context for drawing
    this.canvasCtx = this.canvasElement.nativeElement.getContext('2d');

    // Start the camera
    this.startCamera();
  }

  // Clean up resources when the component is destroyed
  ngOnDestroy() {
    // Stop the camera if it exists
    if (this.camera) {
      this.camera.stop();
    }
  }

  // Load required scripts dynamically
  private async loadScripts(): Promise<void> {
    console.log("Loading scripts...");
    return new Promise<void>((resolve) => {
      // Load TensorFlow.js core
      const tfCore = document.createElement('script');
      tfCore.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core';
      tfCore.onload = () => {
        // Load TensorFlow.js converter
        const tfConverter = document.createElement('script');
        tfConverter.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter';
        tfConverter.onload = () => {
          // Load MediaPipe Hands
          const handsScript = document.createElement('script');
          handsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands';
          handsScript.onload = () => {
            // Load MediaPipe Camera Utils
            const cameraUtils = document.createElement('script');
            cameraUtils.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils';
            cameraUtils.onload = () => {
              resolve();
            };
            document.body.appendChild(cameraUtils);
          };
          document.body.appendChild(handsScript);
        };
        document.body.appendChild(tfConverter);
      };
      document.body.appendChild(tfCore);
    });
  }

  // Initialize MediaPipe Hands
  private initializeHandTracking(): void {
    // Create a new Hands instance
    this.hands = new Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    // Configure Hands options
    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true
    });

    // Set up the results handler
    this.hands.onResults(this.onResults.bind(this));
  }

  // Load the custom TensorFlow.js model
  private async loadModel(): Promise<void> {
    try {
      this.customModel = await tf.loadLayersModel(
        "https://raw.githubusercontent.com/benbot16/cs481_asl/refs/heads/fb_web/asl/src/app/model1.json"
      );
    } catch (error) {
      console.error('Error loading custom model:', error);
      return
    }
    console.log('Custom model loaded successfully');
  }

  // Start the camera
  private startCamera(): void {
    const videoElement = this.videoElement.nativeElement;

    // Create a new Camera instance
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement });
      }
    });

    // Start the camera
    this.camera.start();
  }

  // Calculate landmark list from hand landmarks
  private calc_landmark_list(imgWidth: number, imgHeight: number, landmarks: any): number[][] {
    const landmarkArray = landmarks.map((landmark: any) => {
      const landmark_X = Math.round(Math.min(landmark.x * imgWidth, imgWidth - 1));
      const landmark_Y = Math.round(Math.min(landmark.y * imgHeight, imgHeight - 1));
      return [landmark_X, landmark_Y];
    });

    return landmarkArray;
  }

  // Preprocess landmarks for model input
  private preProcessLandmark(landmarks: number[][]): number[] {
    let baseX = 0;
    let baseY = 0;

    const preProcessLandmark = landmarks.map((landmark, index) => {
      if (index == 0) {
        baseX = landmark[0];
        baseY = landmark[1];
      }

      return [landmark[0] - baseX, landmark[1] - baseY];
    });

    // Convert to a one-dimensional list
    const arr1d = ([] as number[]).concat(...preProcessLandmark as any);

    // absolute value array
    const absArray = arr1d.map((value) => Math.abs(value));

    // max value
    const maxValue = Math.max(...absArray);

    // normalization
    const normalizedArray = arr1d.map((value) => value / maxValue);

    return normalizedArray;
  }

  // Handle results from MediaPipe Hands
  private onResults(results: any): void {
    if (!this.canvasCtx || !this.customModel) return;

    // Get Video Properties
    const videoWidth = this.videoElement.nativeElement.videoWidth;
    const videoHeight = this.videoElement.nativeElement.videoHeight;

    // Set canvas width and height
    this.canvasElement.nativeElement.width = videoWidth;
    this.canvasElement.nativeElement.height = videoHeight;

    this.canvasCtx.save();
    this.canvasCtx.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);
    this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Process hand landmarks
      const landmarks = this.calc_landmark_list(videoWidth, videoHeight, results.multiHandLandmarks[0]);
      const processedLandmarks = this.preProcessLandmark(landmarks);

      // Make prediction with the model
      const data = tf.tensor2d([processedLandmarks]);
      const predict = this.customModel.predict(data).dataSync();
      const gesture = Math.max(...predict);
      const gestureIndex = Array.from(predict).indexOf(gesture);

      // Map prediction to ASL letter
      const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

      // Update the output text
      if (this.outputText.nativeElement.innerText === "No hand detected.") {
        this.signedLetters = "";
      }

      // Set the recognized letter - this only updates the UI, not the history
      const recognizedLetter = labels[gestureIndex];
      this.signedLetters = recognizedLetter;

      // Just track the current letter - don't add to history automatically
      this.handleLetterRecognition(recognizedLetter);

      // Draw hand landmarks
      for (const landmarks of results.multiHandLandmarks) {
        this.drawConnectors(this.canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
        this.drawLandmarks(this.canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
      }
    } else {
      // No hand detected
      this.signedLetters = "No hand detected.";
    }

    this.canvasCtx.restore();
  }

  // Draw connectors between landmarks
  private drawConnectors(ctx: CanvasRenderingContext2D, landmarks: any[], connections: any[], options: any): void {
    const { color = '#00FF00', lineWidth = 5 } = options;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    for (const connection of connections) {
      const [start, end] = connection;

      if (!landmarks[start] || !landmarks[end]) continue;

      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      ctx.beginPath();
      ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
      ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
      ctx.stroke();
    }
  }

  // Draw landmarks
  private drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any[], options: any): void {
    const { color = '#FF0000', lineWidth = 2 } = options;

    ctx.fillStyle = color;

    for (const landmark of landmarks) {
      ctx.beginPath();
      ctx.arc(
        landmark.x * ctx.canvas.width,
        landmark.y * ctx.canvas.height,
        lineWidth * 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }

  // Clear the signed letters
  clearSignedLetters(): void {
    this.signedLetters = '';
    this.letterHistory = [];
    this.parsedSentence = '';
    this.previousLetter = '';
    this.stopLetterCollection();
  }

  // Handle letter recognition for history
  private handleLetterRecognition(letter: string): void {
    // If the letter is the same as the previous one, don't do anything
    if (letter === this.previousLetter) {
      return;
    }

    // Update the previous letter reference - only tracking for display purposes
    this.previousLetter = letter;

    // We don't automatically add letters to history anymore
    // User must explicitly press "Confirm Letter" button
  }

  // Start collecting letters
  startLetterCollection(): void {
    this.isCollectingLetters = true;
    console.log('Started collecting letters - use Confirm Letter to add to history');
  }

  // Stop collecting letters
  stopLetterCollection(): void {
    this.isCollectingLetters = false;
    console.log('Stopped collecting letters');
  }

  // Update the parsed sentence
  private parseSentence(): void {
    this.parsedSentence = this.letterHistory.join('');
  }

  // Save the current sentence to the saved sentences list
  saveSentence(): void {
    if (this.parsedSentence && this.parsedSentence.trim() !== '') {
      // Add the current sentence to the saved sentences array
      this.savedSentences = [...this.savedSentences, this.parsedSentence];

      // Update counter
      this.savedSentencesCount = this.savedSentences.length;

      // Save to localStorage
      this.updateLocalStorage();

      // Show notification
      this.showNotificationMessage('Sentence saved successfully!');
    }
  }

  // Update localStorage with saved sentences and upload to the cloud
  private updateLocalStorage(): void {
    try {
      // Ensure we're storing a valid array
      if (!Array.isArray(this.savedSentences)) {
        this.savedSentences = [];
      }

      const jsonData = JSON.stringify(this.savedSentences);
      // Update the version number and save the data
      var version_num = parseInt((localStorage.getItem(this.VERSION_KEY)?localStorage.getItem(this.VERSION_KEY)!!:"0"!!));
      if(!version_num) {
        version_num = 0;
      }
      version_num++;
      localStorage.setItem(this.VERSION_KEY, version_num.toString())
      localStorage.setItem(this.STORAGE_KEY, jsonData);
      this.savedSentencesCount = this.savedSentences.length;

      // Save the data remotely
      try{
        this.userService.saveData(jsonData, version_num)
      } catch(error) {
        console.log("Error storing strings: ", error);
      }

      // Verify storage was successful
      const verification = localStorage.getItem(this.STORAGE_KEY);
      console.log('Verification from localStorage:', verification);
      if (verification !== jsonData) {
        console.warn('⚠️ Storage verification failed - stored data doesn\'t match what we tried to save');
      }
      // Verify storage worked correctly
      console.log(`Saved ${this.savedSentences.length} sentences to localStorage`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Toggle the saved sentences modal
  toggleSavedSentences(): void {
    // If we're opening the modal, reload the sentences to ensure freshness
    if (!this.showSavedSentences) {
      console.log('Opening saved sentences modal');
      this.loadAllSavedSentences();
      this.showSavedSentences = true;
    } else {
      // Just close the modal
      this.showSavedSentences = false;
    }

    console.log(`Modal open: ${this.showSavedSentences}, Sentences count: ${this.savedSentencesCount}`);
  }

  // Load all saved sentences - can be called anytime to refresh data
  loadAllSavedSentences(): void {
    console.log('Loading saved sentences from storage');

    // Use a direct approach for simplicity and reliability
    try {
      var data = localStorage.getItem(this.STORAGE_KEY);
      var storageNum: number = parseInt(localStorage.getItem(this.VERSION_KEY)?localStorage.getItem(this.VERSION_KEY)!!:"0"!!);
      if(!storageNum) {
        storageNum = 0;
      }

      try {
        var remoteNum = 0;
        this.userService.getSavedVersion().then((result) => {
          remoteNum = result;
        });
        if(storageNum < remoteNum) {
          this.userService.getSavedData().then((result) => {
            data = result;
          });
        }
      } catch(error) {
        console.log("Firebase data retrieval error: ", error)
      }

      // For immediate debugging
      console.log('Raw localStorage data:', data);

      if (data) {
        const parsed = JSON.parse(data);
        console.log('Parsed data:', parsed);

        if (Array.isArray(parsed)) {
          // This creates a new array reference which helps Angular detect the change
          this.savedSentences = [...parsed];
          this.savedSentencesCount = this.savedSentences.length;
          console.log(`Successfully loaded ${this.savedSentences.length} sentences`);
        } else {
          console.warn('Data is not an array, resetting');
          this.savedSentences = [];
          this.savedSentencesCount = 0;
        }
      } else {
        console.log('No saved sentences in localStorage');
        this.savedSentences = [];
        this.savedSentencesCount = 0;
      }
    } catch (error) {
      console.error('Failed to load saved sentences:', error);
      this.savedSentences = [];
      this.savedSentencesCount = 0;
    }
  }

  // Delete a saved sentence
  deleteSavedSentence(index: number): void {
    if (index >= 0 && index < this.savedSentences.length) {
      // Remove the sentence at the specified index
      const updatedSentences = [...this.savedSentences];
      updatedSentences.splice(index, 1);
      this.savedSentences = updatedSentences;

      // Update localStorage
      this.updateLocalStorage();

      // Show notification
      this.showNotificationMessage('Sentence deleted');
    } else {
      console.error('Invalid index for deletion:', index);
    }
  }

  // Clear all saved sentences
  clearStorage(): void {
    this.savedSentences = [];
    this.savedSentencesCount = 0;
    localStorage.removeItem(this.STORAGE_KEY);
    this.showNotificationMessage('All sentences cleared');
  }

  // Show notification message for a limited time
  private showNotificationMessage(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  // Confirm the current letter and add it to the history
  confirmLetter(): void {
    if (this.signedLetters && this.signedLetters !== "No hand detected." && this.isCollectingLetters) {
      // Add the current recognized letter to the history
      this.letterHistory.push(this.signedLetters);
      console.log(`Letter confirmed: ${this.signedLetters}`);

      // Reset previous letter to allow confirming the same letter again if needed
      this.previousLetter = '';

      // Update parsed sentence
      this.parseSentence();
    }
  }

  // Add a space manually
  addSpace(): void {
    if (this.isCollectingLetters) {
      this.letterHistory.push(' ');
      this.previousLetter = ''; // Reset previous letter after adding space

      // Update parsed sentence
      this.parseSentence();
    }
  }

  // Delete the last character
  deleteLastChar(): void {
    if (this.letterHistory.length > 0) {
      this.letterHistory.pop();

      // Update parsed sentence
      this.parseSentence();
    }
  }

  // Toggle letter collection
  toggleLetterCollection(): void {
    if (this.isCollectingLetters) {
      this.stopLetterCollection();
    } else {
      this.startLetterCollection();
    }
  }
}

// Hand connections for drawing
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
  [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
];
