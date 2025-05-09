private fun runInference() {
        // This method should be called from a background thread
        // Replace 'context' and 'byteBuffer' with your actual values.
        // Ensure you have a valid context and a ByteBuffer with your input data.
        try {
            val model = KeypointClassifier1.newInstance(this) // Use 'this' as the context

            // Creates inputs for reference.
            // Replace 'byteBuffer' with your actual input data
            val inputFeature0 = TensorBuffer.createFixedSize(intArrayOf(1, 42), DataType.FLOAT32)
            // inputFeature0.loadBuffer(byteBuffer) // Load your input data here

            // Runs model inference and gets result.
            val outputs = model.process(inputFeature0)
            val outputFeature0 = outputs.outputFeature0AsTensorBuffer

            // Process the output here (e.g., display the result)
            val inferenceResult = outputFeature0.floatArray
            // Log.d("MainActivity", "Inference result: ${inferenceResult.joinToString()}")

            // Update UI on the main thread if needed
            // runOnUiThread {
            //    binding.resultTextView.text = "Inference complete"
            // }

            // Releases model resources if no longer used.
            model.close()
        } catch (e: IOException) {
            // Handle the exception (e.g., log an error)
            e.printStackTrace()
        }
    }