import { useState, useEffect } from 'react'
import claudeService from '../services/claudeService'
import './AIAnalysis.css'

const AIAnalysis = ({ sideImage, topImage, onComplete, onRetake, onManualAssessment }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const analyzeBCS = async () => {
      let progressInterval = null
      try {
        setLoading(true)
        setError(null)
        setProgress(10)

        console.log('Starting BCS analysis...')
        console.log('Side image data length:', sideImage?.length)
        console.log('Top image data length:', topImage?.length)

        // Simulate loading progress
        progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90))
        }, 300)

        // Load Claude API client if not loaded
        setProgress(20)
        console.log('Loading Claude API...')
        await claudeService.load()
        console.log('Claude API loaded successfully')

        setProgress(50)

        // Perform prediction with both images
        console.log('Starting AI analysis...')
        const result = await claudeService.predict(sideImage, topImage)
        console.log('AI analysis complete:', result)

        clearInterval(progressInterval)
        setProgress(100)

        setPrediction(result)
        setLoading(false)
      } catch (err) {
        console.error('Analysis error:', err)
        if (progressInterval) {
          clearInterval(progressInterval)
        }

        let errorMessage = 'Failed to analyze image. '
        if (err.message?.includes('Failed to load image')) {
          errorMessage += 'Could not load the image. Please try a different photo.'
        } else if (err.message?.includes('API key')) {
          errorMessage += 'API configuration error. Please check your settings.'
        } else if (err.message?.includes('rate limit')) {
          errorMessage += 'API rate limit reached. Please try again in a moment.'
        } else {
          errorMessage += err.message || 'Please try again or use manual assessment.'
        }

        setError(errorMessage)
        setLoading(false)
      }
    }

    analyzeBCS()
  }, [sideImage, topImage])

  const handleConfirm = () => {
    onComplete(prediction.bcsScore, prediction)
  }

  if (loading) {
    return (
      <div className="ai-analysis">
        <div className="analysis-card">
          <div className="loading-container">
            <div className="ai-icon">🤖</div>
            <h2>AI Analysis in Progress</h2>
            <p>Analyzing your dog's body condition...</p>

            <div className="progress-container">
              <div className="progress-bar-ai">
                <div
                  className="progress-fill-ai"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="progress-text">{progress}%</p>
            </div>

            <div className="loading-steps">
              <div className={`step ${progress >= 20 ? 'completed' : 'active'}`}>
                <span className="step-icon">⚙️</span>
                <span>Connecting to Claude AI</span>
              </div>
              <div className={`step ${progress >= 50 ? 'completed' : progress >= 20 ? 'active' : ''}`}>
                <span className="step-icon">🔍</span>
                <span>Analyzing Image</span>
              </div>
              <div className={`step ${progress >= 100 ? 'completed' : progress >= 50 ? 'active' : ''}`}>
                <span className="step-icon">📊</span>
                <span>Calculating Score</span>
              </div>
            </div>
          </div>

          <div className="images-preview-grid-ai">
            <div className="preview-small-ai">
              <p>Side View</p>
              <img src={sideImage} alt="Side view" />
            </div>
            <div className="preview-small-ai">
              <p>Top View</p>
              <img src={topImage} alt="Top view" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ai-analysis">
        <div className="analysis-card">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Analysis Failed</h2>
            <p>{error}</p>

            <div className="images-preview-grid-ai">
              <div className="preview-small-ai">
                <p>Side View</p>
                <img src={sideImage} alt="Side view" />
              </div>
              <div className="preview-small-ai">
                <p>Top View</p>
                <img src={topImage} alt="Top view" />
              </div>
            </div>

            <div className="error-actions">
              <button onClick={onRetake} className="outline">
                Retake Photo
              </button>
              <button onClick={onManualAssessment} className="primary-button">
                Manual Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-analysis">
      <div className="analysis-card">
        <div className="result-header-ai">
          <div className="ai-badge">
            <span className="ai-icon-small">🤖</span>
            <span>AI Analysis</span>
          </div>
          <button onClick={onRetake} className="back-button">
            ← Retake Photo
          </button>
        </div>

        <div className="images-preview-main-grid">
          <div className="preview-main-item">
            <p className="preview-main-label">Side View</p>
            <img src={sideImage} alt="Side view" />
          </div>
          <div className="preview-main-item">
            <p className="preview-main-label">Top View</p>
            <img src={topImage} alt="Top view" />
            {prediction.analysis.isDogDetected && (
              <div className="detection-badge">
                ✓ Dog Detected
              </div>
            )}
          </div>
        </div>

        <div className="prediction-summary">
          <h2>Analysis Complete</h2>
          <div className="confidence-indicator">
            <span className="confidence-label">Confidence:</span>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${prediction.confidence * 100}%` }}
              />
            </div>
            <span className="confidence-value">
              {Math.round(prediction.confidence * 100)}%
            </span>
          </div>
        </div>

        <div className="bcs-prediction">
          <div className="predicted-score">
            <span className="score-label">Predicted BCS</span>
            <span className="score-value-large">{prediction.bcsScore}/9</span>
          </div>

          <div className="analysis-details">
            <h3>Analysis Breakdown</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Waist Definition</span>
                <div className="detail-bar">
                  <div
                    className="detail-fill"
                    style={{ width: `${prediction.analysis.waistDefinition * 100}%` }}
                  />
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Body Shape</span>
                <div className="detail-bar">
                  <div
                    className="detail-fill"
                    style={{ width: `${prediction.analysis.bodyShape * 100}%` }}
                  />
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Overall Condition</span>
                <div className="detail-bar">
                  <div
                    className="detail-fill"
                    style={{ width: `${prediction.analysis.overallCondition * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {prediction.analysis.detectedObjects && (
            <div className="detected-objects">
              <h4>Detected in Image:</h4>
              <ul>
                {prediction.analysis.detectedObjects.map((obj, idx) => (
                  <li key={idx}>
                    {obj.className} ({Math.round(obj.probability * 100)}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="ai-recommendations">
          <h3>AI Recommendations</h3>
          <ul>
            {prediction.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="ai-disclaimer">
          <p>
            <strong>Note:</strong> This AI analysis is for educational purposes and uses
            computer vision techniques. For best results, ensure the photo shows a clear
            side view of your dog. Always consult a veterinarian for professional assessment.
          </p>
        </div>

        <div className="action-buttons">
          <button onClick={onManualAssessment} className="outline">
            Manual Assessment
          </button>
          <button onClick={handleConfirm} className="primary-button">
            View Full Results
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIAnalysis
