import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import { imageToTensor, preprocessImage, extractBodyMeasurements, cleanupTensors } from '../utils/imageProcessing'

class BCSModel {
  constructor() {
    this.mobilenet = null
    this.isLoaded = false
  }

  /**
   * Load the model
   */
  async load() {
    if (this.isLoaded) return

    try {
      console.log('Loading MobileNet model...')
      // Load MobileNet for feature extraction
      this.mobilenet = await mobilenet.load({
        version: 2,
        alpha: 1.0
      })
      this.isLoaded = true
      console.log('Model loaded successfully')
    } catch (error) {
      console.error('Error loading model:', error)
      throw error
    }
  }

  /**
   * Predict BCS from image
   * @param {string} base64Image - Base64 encoded image
   * @returns {Promise<Object>} - Prediction result with score and confidence
   */
  async predict(base64Image) {
    if (!base64Image) {
      throw new Error('No image provided')
    }

    if (!base64Image.startsWith('data:image/')) {
      throw new Error('Invalid image format')
    }

    if (!this.isLoaded) {
      await this.load()
    }

    let imageTensor = null

    try {
      console.log('Converting image to tensor...')
      // Convert image to tensor
      imageTensor = await imageToTensor(base64Image)
      console.log('Image tensor created:', imageTensor.shape)

      console.log('Extracting features with MobileNet...')
      // Extract features using MobileNet
      const features = await this.extractFeatures(imageTensor)
      console.log('Features extracted')

      console.log('Extracting body measurements...')
      // Extract body measurements
      const measurements = await extractBodyMeasurements(imageTensor)
      console.log('Measurements extracted:', measurements)

      console.log('Analyzing BCS...')
      // Analyze and predict BCS
      const prediction = await this.analyzeBCS(features, measurements, imageTensor)
      console.log('BCS analysis complete')

      return prediction
    } catch (error) {
      console.error('Error during prediction:', error)
      throw error
    } finally {
      // Cleanup
      cleanupTensors(imageTensor)
    }
  }

  /**
   * Extract features from image using MobileNet
   * @param {tf.Tensor3D} imageTensor - Image tensor
   * @returns {Promise<Object>} - Extracted features
   */
  async extractFeatures(imageTensor) {
    try {
      // Get embeddings (internal representation)
      const embeddings = this.mobilenet.infer(imageTensor, true)

      // Get classifications to understand image content
      const classifications = await this.mobilenet.classify(imageTensor)

      // Check if it's a dog image
      const isDog = classifications.some(c =>
        c.className.toLowerCase().includes('dog') ||
        c.className.toLowerCase().includes('canine')
      )

      const features = {
        embeddings: await embeddings.array(),
        classifications,
        isDog,
        confidence: isDog ? classifications[0].probability : 0
      }

      embeddings.dispose()

      return features
    } catch (error) {
      console.error('Error extracting features:', error)
      throw error
    }
  }

  /**
   * Analyze BCS based on features and measurements
   * @param {Object} features - Extracted features
   * @param {Object} measurements - Body measurements
   * @param {tf.Tensor3D} imageTensor - Original image tensor
   * @returns {Promise<Object>} - BCS prediction
   */
  async analyzeBCS(features, measurements, imageTensor) {
    // Note: This is a heuristic-based approach for demonstration
    // In production, this would be replaced with a trained classifier

    // Analyze image characteristics
    const bodyAnalysis = await this.analyzeBodyCondition(imageTensor, measurements)

    // Combine multiple factors for BCS estimation
    const bcsScore = this.calculateBCSScore(bodyAnalysis, features, measurements)

    // Calculate confidence based on image quality and dog detection
    const confidence = this.calculateConfidence(features, bodyAnalysis)

    return {
      bcsScore,
      confidence,
      analysis: {
        waistDefinition: bodyAnalysis.waistScore,
        bodyShape: bodyAnalysis.shapeScore,
        overallCondition: bodyAnalysis.overallScore,
        isDogDetected: features.isDog,
        detectedObjects: features.classifications.slice(0, 3)
      },
      measurements,
      recommendations: this.generateRecommendations(bcsScore)
    }
  }

  /**
   * Analyze body condition from image
   * @param {tf.Tensor3D} imageTensor - Image tensor
   * @param {Object} measurements - Body measurements
   * @returns {Promise<Object>} - Body condition analysis
   */
  async analyzeBodyCondition(imageTensor, measurements) {
    return tf.tidy(() => {
      // Analyze brightness/contrast (can indicate visibility of ribs/bones)
      const brightness = tf.mean(imageTensor).arraySync() / 255

      // Analyze color variance (can indicate fur texture and visibility)
      const variance = tf.moments(imageTensor).variance.mean().arraySync() / 255

      // Waist ratio from measurements
      const waistScore = this.scoreWaist(measurements.waistRatio)

      // Shape analysis based on edge strength
      const shapeScore = this.scoreShape(measurements.edgeStrength)

      // Overall condition score (0-1 scale)
      const overallScore = (waistScore + shapeScore) / 2

      return {
        brightness,
        variance,
        waistScore,
        shapeScore,
        overallScore
      }
    })
  }

  /**
   * Score waist definition
   * @param {number} waistRatio - Waist ratio measurement
   * @returns {number} - Score 0-1
   */
  scoreWaist(waistRatio) {
    // Lower ratio = more defined waist = lower BCS
    // Higher ratio = less defined waist = higher BCS
    return Math.min(1, Math.max(0, waistRatio))
  }

  /**
   * Score body shape
   * @param {number} edgeStrength - Edge strength measurement
   * @returns {number} - Score 0-1
   */
  scoreShape(edgeStrength) {
    // Higher edge strength might indicate visible ribs/bones
    // Normalize to 0-1 scale
    return Math.min(1, Math.max(0, 1 - edgeStrength * 2))
  }

  /**
   * Calculate final BCS score (1-9 scale)
   * @param {Object} bodyAnalysis - Body condition analysis
   * @param {Object} features - Extracted features
   * @param {Object} measurements - Body measurements
   * @returns {number} - BCS score 1-9
   */
  calculateBCSScore(bodyAnalysis, features, measurements) {
    // Combine multiple factors
    const waistFactor = bodyAnalysis.waistScore
    const shapeFactor = bodyAnalysis.shapeScore

    // Weighted combination
    const combinedScore = (waistFactor * 0.6) + (shapeFactor * 0.4)

    // Map to 1-9 BCS scale
    // Lower combinedScore = more defined features = lower BCS (thin)
    // Higher combinedScore = less defined features = higher BCS (overweight)
    const bcsScore = Math.round(1 + (combinedScore * 8))

    // Add some randomness for demo purposes (±1 point)
    // In production, this would be the model's actual prediction
    const variance = Math.random() > 0.5 ? 1 : 0
    const adjustedScore = Math.max(1, Math.min(9, bcsScore + variance))

    // Bias slightly toward ideal range (4-6) for demo
    if (adjustedScore < 4) return Math.max(3, adjustedScore + 1)
    if (adjustedScore > 6) return Math.min(7, adjustedScore - 1)

    return adjustedScore
  }

  /**
   * Calculate confidence in prediction
   * @param {Object} features - Extracted features
   * @param {Object} bodyAnalysis - Body condition analysis
   * @returns {number} - Confidence 0-1
   */
  calculateConfidence(features, bodyAnalysis) {
    let confidence = 0.5 // Base confidence

    // Boost confidence if dog is detected
    if (features.isDog) {
      confidence += 0.3
    }

    // Boost confidence based on image quality
    if (bodyAnalysis.variance > 0.1 && bodyAnalysis.variance < 0.3) {
      confidence += 0.1
    }

    // Cap at reasonable level since this is not a fully trained model
    confidence = Math.min(0.85, confidence)

    return confidence
  }

  /**
   * Generate recommendations based on BCS
   * @param {number} bcsScore - BCS score
   * @returns {string[]} - Recommendations
   */
  generateRecommendations(bcsScore) {
    if (bcsScore <= 3) {
      return [
        'The AI analysis suggests your dog may be underweight',
        'Please consult your veterinarian for confirmation',
        'A professional examination is recommended'
      ]
    } else if (bcsScore <= 5) {
      return [
        'The AI analysis suggests your dog is in good condition',
        'Continue current diet and exercise routine',
        'Regular vet check-ups are still important'
      ]
    } else if (bcsScore <= 7) {
      return [
        'The AI analysis suggests your dog may be overweight',
        'Consider consulting your veterinarian',
        'Gradual diet and exercise adjustments may help'
      ]
    } else {
      return [
        'The AI analysis suggests your dog may be significantly overweight',
        'Veterinary consultation is strongly recommended',
        'A professional weight management plan may be needed'
      ]
    }
  }
}

// Create singleton instance
const bcsModel = new BCSModel()

export default bcsModel
