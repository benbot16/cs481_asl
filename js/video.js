    const videoElement = document.querySelector("#video");
    const canvasElement = document.querySelector("#output-canvas");
    const canvasCtx = canvasElement.getContext("2d");
    const outputText = document.querySelector("#translated-text");

    const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });
    let customModel = null;
    let camera = null;
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true
    });
    hands.onResults(onResults);

    async function loadModel() {
        customModel = await tf.loadLayersModel(
          "https://raw.githubusercontent.com/Narottam04/SignLanguage/master/frontend/model/asl_alphabets_A-F/model.json"
        );
      }
    loadModel();

    camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        }
      });
      camera.start();

    function calc_landmark_list(imgWidth, imgHeight, landmarks) {
        const landmarkArray = landmarks.map((landmark) => {
            const landmark_X = Math.round(Math.min(landmark.x * imgWidth, imgWidth - 1));
            const landmark_Y = Math.round(Math.min(landmark.y * imgHeight, imgHeight - 1));
            return [landmark_X, landmark_Y];
        });
        
        return landmarkArray;
    }

    function preProcessLandmark(landmarks) {
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
        const arr1d = [].concat(...preProcessLandmark);
      
        // absolute value array
        const absArray = arr1d.map((value) => Math.abs(value));
      
        // max value
        const maxValue = Math.max(...absArray);
      
        // normalization
        const normalizedArray = arr1d.map((value) => value / maxValue);
      
        return normalizedArray;
    }

    function onResults(results) {
        // Get Video Properties
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;

        // Set video width and height
        canvasElement.width = videoWidth;
        canvasElement.height = videoHeight;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {

        const landmarks = calc_landmark_list(videoWidth, videoHeight, results.multiHandLandmarks[0]);
        const processedLandmarks = preProcessLandmark(landmarks);
        const data = tf.tensor2d([processedLandmarks]);
        const predict = customModel.predict(data).dataSync();
        const gesture = Math.max(...predict);
        const gestureIndex = predict.indexOf(gesture);
        const labels = ["A", "B", "C", "D", "E", "F"];
        if (outputText.innerText === "No hand detected.") {
            outputText.innerText = "";
        }
        outputText.innerText = `${labels[gestureIndex]}`;
      } else {
        outputText.innerText = "No hand detected.";
      }
      canvasCtx.restore();
    }