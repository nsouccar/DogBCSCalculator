import { useState, useRef, useEffect } from 'react'
import './CameraCapture.css'

const CameraCapture = ({ onCapture, onCancel }) => {
  const [step, setStep] = useState(1) // 1 = side photo, 2 = top photo
  const [stream, setStream] = useState(null)
  const [sideImage, setSideImage] = useState(null)
  const [topImage, setTopImage] = useState(null)
  const [currentCapture, setCurrentCapture] = useState(null)
  const [error, setError] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!currentCapture) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [facingMode, currentCapture])

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please ensure you have granted camera permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCurrentCapture(imageData)
  }

  const retake = () => {
    setCurrentCapture(null)
  }

  const confirmCapture = () => {
    if (step === 1) {
      setSideImage(currentCapture)
      setCurrentCapture(null)
      setStep(2)
    } else {
      setTopImage(currentCapture)
      stopCamera()
      // Both images captured, pass them up
      onCapture(sideImage, currentCapture)
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    setCurrentCapture(null)
  }

  const handleCancel = () => {
    stopCamera()
    onCancel()
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    stopCamera()

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target.result
      setCurrentCapture(imageData)
      setError(null)
    }
    reader.onerror = () => {
      setError('Failed to load image. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const goBackStep = () => {
    if (step === 2) {
      setStep(1)
      setCurrentCapture(null)
      setSideImage(null)
    }
  }

  const getInstructions = () => {
    if (step === 1) {
      return {
        title: 'Step 1: Side Profile',
        description: 'Position yourself to the side of your dog',
        tip: 'Capture their full body from shoulder to tail'
      }
    } else {
      return {
        title: 'Step 2: Top View',
        description: 'Stand above your dog looking down',
        tip: 'Capture from directly overhead showing their back and waist'
      }
    }
  }

  const instructions = getInstructions()

  return (
    <div className="camera-capture">
      <div className="step-indicator">
        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className="step-line"></div>
        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
      </div>

      <div className="step-title">
        <h2>{instructions.title}</h2>
        <p>{instructions.description}</p>
      </div>

      <div className="camera-container">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleCancel}>Go Back</button>
          </div>
        )}

        {!error && !currentCapture && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />
            <div className="camera-overlay">
              <div className="camera-guide">
                <p>{instructions.description}</p>
                <p className="camera-tip">{instructions.tip}</p>
              </div>
            </div>
          </>
        )}

        {currentCapture && (
          <div className="preview-container">
            <img src={currentCapture} alt="Captured" className="captured-image" />
            <p className="preview-text">Does this photo look good?</p>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="camera-controls">
        {!currentCapture ? (
          <>
            {step === 2 ? (
              <button onClick={goBackStep} className="outline">
                ← Back
              </button>
            ) : (
              <button onClick={handleCancel} className="outline">
                Cancel
              </button>
            )}
            <button onClick={capturePhoto} className="capture-button">
              <span className="capture-icon">📷</span>
              Capture
            </button>
            <button onClick={switchCamera} className="outline">
              <span>🔄</span>
              Flip
            </button>
          </>
        ) : (
          <>
            <button onClick={retake} className="outline">
              Retake
            </button>
            <button onClick={confirmCapture} className="primary-button">
              {step === 1 ? 'Next: Top View' : 'Finish'}
            </button>
          </>
        )}
      </div>

      <div className="upload-section">
        <div className="divider">
          <span>OR</span>
        </div>
        <button onClick={triggerFileUpload} className="upload-button outline">
          <span>📁</span>
          Upload {step === 1 ? 'Side' : 'Top'} Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      {sideImage && step === 2 && (
        <div className="completed-photo">
          <p>✓ Side photo captured</p>
        </div>
      )}
    </div>
  )
}

export default CameraCapture
