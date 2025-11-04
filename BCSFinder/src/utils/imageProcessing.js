import * as tf from '@tensorflow/tfjs'

/**
 * Convert base64 image to TensorFlow tensor
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<tf.Tensor3D>} - Preprocessed image tensor
 */
export const imageToTensor = async (base64Image) => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    // Only set crossOrigin for external URLs, not for data URLs
    if (!base64Image.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }

    img.onload = () => {
      try {
        console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height)
        // Convert image to tensor
        const tensor = tf.browser.fromPixels(img)
        console.log('Tensor created:', tensor.shape)
        resolve(tensor)
      } catch (error) {
        console.error('Error converting image to tensor:', error)
        reject(error)
      }
    }

    img.onerror = (error) => {
      console.error('Error loading image:', error)
      reject(new Error('Failed to load image'))
    }

    img.src = base64Image
  })
}

/**
 * Preprocess image for model input
 * @param {tf.Tensor3D} imageTensor - Image tensor
 * @param {number} targetSize - Target size for resizing
 * @returns {tf.Tensor4D} - Preprocessed batch tensor
 */
export const preprocessImage = (imageTensor, targetSize = 224) => {
  return tf.tidy(() => {
    // Resize to target size
    const resized = tf.image.resizeBilinear(imageTensor, [targetSize, targetSize])

    // Normalize to [0, 1]
    const normalized = resized.div(255.0)

    // Add batch dimension
    const batched = normalized.expandDims(0)

    return batched
  })
}

/**
 * Extract key body measurements from image
 * @param {tf.Tensor3D} imageTensor - Image tensor
 * @returns {Object} - Body measurements
 */
export const extractBodyMeasurements = async (imageTensor) => {
  return tf.tidy(() => {
    // Convert to grayscale for edge detection
    const grayscale = tf.mean(imageTensor, -1, true)

    // Simple edge detection using Sobel-like operation
    const edges = detectEdges(grayscale)

    // Analyze body contours
    const measurements = analyzeContours(edges)

    return measurements
  })
}

/**
 * Simple edge detection
 * @param {tf.Tensor} image - Grayscale image tensor
 * @returns {tf.Tensor} - Edge map
 */
const detectEdges = (image) => {
  return tf.tidy(() => {
    // Sobel X kernel
    const sobelX = tf.tensor2d([
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ]).expandDims(2).expandDims(3)

    // Sobel Y kernel
    const sobelY = tf.tensor2d([
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ]).expandDims(2).expandDims(3)

    // image is already rank 3 (height, width, channels)
    // Only add batch dimension to make it rank 4
    const img4d = image.expandDims(0)

    // Apply Sobel filters
    const gradX = tf.conv2d(img4d, sobelX, 1, 'same')
    const gradY = tf.conv2d(img4d, sobelY, 1, 'same')

    // Compute magnitude
    const magnitude = tf.sqrt(tf.add(tf.square(gradX), tf.square(gradY)))

    return magnitude.squeeze()
  })
}

/**
 * Analyze contours to extract measurements
 * @param {tf.Tensor} edges - Edge map
 * @returns {Object} - Measurements
 */
const analyzeContours = (edges) => {
  // This is a simplified version
  // In a full implementation, you'd use more sophisticated contour analysis
  const data = edges.arraySync()

  // Calculate some basic metrics
  const height = data.length
  const width = data[0].length

  // Analyze horizontal profile (for waist detection)
  const horizontalProfile = []
  for (let y = 0; y < height; y++) {
    let sum = 0
    for (let x = 0; x < width; x++) {
      sum += data[y][x]
    }
    horizontalProfile.push(sum)
  }

  // Find narrowest point (potential waist)
  const midSection = horizontalProfile.slice(
    Math.floor(height * 0.3),
    Math.floor(height * 0.7)
  )
  const minWaist = Math.min(...midSection)
  const maxWaist = Math.max(...midSection)
  const waistRatio = minWaist / (maxWaist + 1e-6)

  return {
    waistRatio,
    edgeStrength: tf.mean(edges).arraySync(),
    height,
    width
  }
}

/**
 * Cleanup TensorFlow memory
 */
export const cleanupTensors = (...tensors) => {
  tensors.forEach(tensor => {
    if (tensor && typeof tensor.dispose === 'function') {
      tensor.dispose()
    }
  })
}
