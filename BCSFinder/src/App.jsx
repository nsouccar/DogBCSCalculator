import { useState } from 'react'
import './App.css'
import CameraCapture from './components/CameraCapture'
import BCSAssessment from './components/BCSAssessment'
import AIAnalysis from './components/AIAnalysis'
import BCSResult from './components/BCSResult'
import BCSGuide from './components/BCSGuide'

function App() {
  const [step, setStep] = useState('welcome') // welcome, camera, choice, ai-analysis, assessment, result, guide
  const [capturedImage, setCapturedImage] = useState(null)
  const [bcsScore, setBcsScore] = useState(null)
  const [aiPrediction, setAiPrediction] = useState(null)

  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData)
    setStep('choice')
  }

  const handleAssessmentComplete = (score, prediction = null) => {
    setBcsScore(score)
    if (prediction) {
      setAiPrediction(prediction)
    }
    setStep('result')
  }

  const handleReset = () => {
    setCapturedImage(null)
    setBcsScore(null)
    setAiPrediction(null)
    setStep('welcome')
  }

  const showGuide = () => {
    setStep('guide')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dog BCS Calculator</h1>
        <p>AI-Powered Body Condition Score Assessment</p>
      </header>

      <main className="app-main">
        {step === 'welcome' && (
          <div className="welcome-screen">
            <div className="welcome-card">
              <div className="dog-icon">🐕</div>
              <h2>Welcome!</h2>
              <p>
                Assess your dog's Body Condition Score using AI-powered computer vision.
                Take a photo and let our AI analyze your dog's body condition.
              </p>
              <div className="button-group">
                <button onClick={() => setStep('camera')} className="primary-button">
                  Start AI Assessment
                </button>
                <button onClick={showGuide} className="outline">
                  View BCS Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'camera' && (
          <CameraCapture
            onCapture={handleImageCapture}
            onCancel={handleReset}
          />
        )}

        {step === 'choice' && (
          <div className="welcome-screen">
            <div className="welcome-card">
              <h2>Choose Assessment Method</h2>
              <div className="image-preview-small">
                <img src={capturedImage} alt="Your dog" style={{ borderRadius: '12px', marginBottom: '20px' }} />
              </div>
              <p style={{ marginBottom: '24px' }}>
                How would you like to assess your dog's BCS?
              </p>
              <div className="button-group">
                <button onClick={() => setStep('ai-analysis')} className="primary-button">
                  🤖 AI Analysis
                </button>
                <button onClick={() => setStep('assessment')} className="secondary">
                  📋 Manual Assessment
                </button>
                <button onClick={() => setStep('camera')} className="outline">
                  Retake Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'ai-analysis' && (
          <AIAnalysis
            image={capturedImage}
            onComplete={handleAssessmentComplete}
            onRetake={() => setStep('camera')}
            onManualAssessment={() => setStep('assessment')}
          />
        )}

        {step === 'assessment' && (
          <BCSAssessment
            image={capturedImage}
            onComplete={handleAssessmentComplete}
            onRetake={() => setStep('camera')}
          />
        )}

        {step === 'result' && (
          <BCSResult
            score={bcsScore}
            image={capturedImage}
            aiPrediction={aiPrediction}
            onReset={handleReset}
            onViewGuide={showGuide}
          />
        )}

        {step === 'guide' && (
          <BCSGuide
            onClose={() => setStep('welcome')}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Note: This tool provides general guidance. Consult your veterinarian for professional advice.</p>
      </footer>
    </div>
  )
}

export default App
