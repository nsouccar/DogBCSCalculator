import { useState, useRef, useEffect } from 'react'
import './CameraCapture.css'

const CameraCapture = ({ onCapture, onCancel }) => {
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [error, setError] = useState(null)
  const [facingMode, setFacingMode] = useState('environment') // 'user' or 'environment'
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

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
    setCapturedImage(imageData)
  }

  const retake = () => {
    setCapturedImage(null)
  }

  const confirmCapture = () => {
    stopCamera()
    onCapture(capturedImage)
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    setCapturedImage(null)
  }

  const handleCancel = () => {
    stopCamera()
    onCancel()
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Stop camera if running
    stopCamera()

    // Read file and convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target.result
      setCapturedImage(imageData)
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

  return (
    <div className="camera-capture">
      <div className="camera-container">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleCancel}>Go Back</button>
          </div>
        )}

        {!error && !capturedImage && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />
            <div className="camera-overlay">
              <div className="camera-guide">
                <p>Position your dog in the frame</p>
                <p className="camera-tip">Take a side view photo for best results</p>
              </div>
            </div>
          </>
        )}

        {capturedImage && (
          <div className="preview-container">
            <img src={capturedImage} alt="Captured" className="captured-image" />
            <p className="preview-text">Does this photo look good?</p>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="camera-controls">
        {!capturedImage ? (
          <>
            <button onClick={handleCancel} className="outline">
              Cancel
            </button>
            <button onClick={capturePhoto} className="capture-button">
              <span className="capture-icon">📷</span>
              Capture Photo
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
              Use This Photo
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
          Upload Photo from Device
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}

export default CameraCapture
