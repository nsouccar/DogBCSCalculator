import { useState } from 'react'
import './App.css'
import CameraCapture from './components/CameraCapture'
import BCSAssessment from './components/BCSAssessment'
import AIAnalysis from './components/AIAnalysis'
import BCSResult from './components/BCSResult'
import BCSGuide from './components/BCSGuide'

function App() {
  const [step, setStep] = useState('welcome') // welcome, photo-guide, camera, choice, ai-analysis, assessment, result, guide
  const [sideImage, setSideImage] = useState(null)
  const [topImage, setTopImage] = useState(null)
  const [bcsScore, setBcsScore] = useState(null)
  const [aiPrediction, setAiPrediction] = useState(null)

  const handleImagesCapture = (side, top) => {
    setSideImage(side)
    setTopImage(top)
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
    setSideImage(null)
    setTopImage(null)
    setBcsScore(null)
    setAiPrediction(null)
    setStep('welcome')
  }

  const showGuide = () => {
    setStep('guide')
  }

  const startPhotoCapture = () => {
    setStep('photo-guide')
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
                <button onClick={startPhotoCapture} className="primary-button">
                  Start Assessment
                </button>
                <button onClick={showGuide} className="outline">
                  View BCS Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'photo-guide' && (
          <div className="welcome-screen">
            <div className="welcome-card">
              <div className="dog-icon">📸</div>
              <h2>Two Photos Needed</h2>
              <p>
                For the most accurate assessment, we need photos from two angles:
              </p>
              <div className="photo-guide-info">
                <div className="guide-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Side Profile</h3>
                    <p>Stand to the side of your dog and capture their full body from the side</p>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Top View</h3>
                    <p>Stand above your dog and capture them from directly overhead</p>
                  </div>
                </div>
              </div>
              <div className="button-group">
                <button onClick={() => setStep('camera')} className="primary-button">
                  Continue to Camera
                </button>
                <button onClick={handleReset} className="outline">
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'camera' && (
          <CameraCapture
            onCapture={handleImagesCapture}
            onCancel={handleReset}
          />
        )}

        {step === 'choice' && (
          <div className="welcome-screen">
            <div className="welcome-card">
              <h2>Choose Assessment Method</h2>
              <div className="images-preview-grid">
                <div className="preview-item">
                  <p className="preview-label">Side View</p>
                  <img src={sideImage} alt="Side view" style={{ borderRadius: '12px', width: '100%', marginBottom: '8px' }} />
                </div>
                <div className="preview-item">
                  <p className="preview-label">Top View</p>
                  <img src={topImage} alt="Top view" style={{ borderRadius: '12px', width: '100%', marginBottom: '8px' }} />
                </div>
              </div>
              <p style={{ marginBottom: '24px', marginTop: '20px' }}>
                How would you like to assess your dog's BCS?
              </p>
              <div className="button-group">
                <button onClick={() => setStep('ai-analysis')} className="primary-button">
                  🤖 AI Analysis
                </button>
                <button onClick={() => setStep('assessment')} className="secondary">
                  📋 Manual Assessment
                </button>
                <button onClick={() => setStep('photo-guide')} className="outline">
                  Retake Photos
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'ai-analysis' && (
          <AIAnalysis
            sideImage={sideImage}
            topImage={topImage}
            onComplete={handleAssessmentComplete}
            onRetake={() => setStep('photo-guide')}
            onManualAssessment={() => setStep('assessment')}
          />
        )}

        {step === 'assessment' && (
          <BCSAssessment
            sideImage={sideImage}
            topImage={topImage}
            onComplete={handleAssessmentComplete}
            onRetake={() => setStep('photo-guide')}
          />
        )}

        {step === 'result' && (
          <BCSResult
            score={bcsScore}
            sideImage={sideImage}
            topImage={topImage}
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
