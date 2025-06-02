// Import necessary Angular modules and components
import { AsyncPipe, NgIf } from '@angular/common';
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
  imports: [AsyncPipe, FormsModule, NgIf] // Required imports for template usage
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
    // Load required scripts dynamically
    await this.loadScripts();

    // Initialize MediaPipe Hands
    this.initializeHandTracking();

    // Load the custom TensorFlow.js model
    this.loadModel();
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
      maxNumHands: 1,
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
        "https://raw.githubusercontent.com/benbot16/cs481_asl/refs/heads/fb_web/asl/src/app/model.json"
      );
      console.log('Custom model loaded successfully');
    } catch (error) {
      console.error('Error loading custom model:', error);
    }
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
      const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

      // Update the output text
      if (this.outputText.nativeElement.innerText === "No hand detected.") {
        this.signedLetters = "";
      }

      // Set the recognized letter
      this.signedLetters = `${labels[gestureIndex]}`;

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
