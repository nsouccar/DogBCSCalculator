import './BCSResult.css'

const getBCSInterpretation = (score) => {
  if (score <= 3) {
    return {
      category: 'Underweight',
      color: '#FF9800',
      icon: '⚠️',
      description: 'Your dog appears to be underweight.',
      recommendations: [
        'Consult your veterinarian for a health check',
        'Discuss appropriate diet and feeding schedule',
        'Rule out underlying health issues',
        'Consider increasing caloric intake gradually'
      ]
    }
  } else if (score <= 5) {
    return {
      category: 'Ideal',
      color: '#4CAF50',
      icon: '✅',
      description: 'Your dog appears to be at an ideal weight!',
      recommendations: [
        'Maintain current diet and exercise routine',
        'Continue regular vet check-ups',
        'Monitor weight regularly',
        'Keep up the great work!'
      ]
    }
  } else if (score <= 7) {
    return {
      category: 'Overweight',
      color: '#FF9800',
      icon: '⚠️',
      description: 'Your dog appears to be overweight.',
      recommendations: [
        'Consult your veterinarian for a weight loss plan',
        'Increase daily exercise gradually',
        'Monitor portion sizes carefully',
        'Reduce treats and table scraps'
      ]
    }
  } else {
    return {
      category: 'Obese',
      color: '#f44336',
      icon: '🚨',
      description: 'Your dog appears to be obese.',
      recommendations: [
        'Schedule a veterinary consultation urgently',
        'Develop a supervised weight loss program',
        'Address potential health complications',
        'Increase activity level under vet guidance'
      ]
    }
  }
}

const BCSResult = ({ score, sideImage, topImage, aiPrediction, onReset, onViewGuide }) => {
  const result = getBCSInterpretation(score)

  return (
    <div className="bcs-result">
      <div className="result-card">
        {aiPrediction && (
          <div className="ai-badge-header">
            <span className="ai-icon">🤖</span>
            <span>AI-Assisted Assessment</span>
            <span className="confidence-badge">
              {Math.round(aiPrediction.confidence * 100)}% Confidence
            </span>
          </div>
        )}

        <div className="result-header" style={{ borderColor: result.color }}>
          <div className="result-icon" style={{ backgroundColor: result.color }}>
            {result.icon}
          </div>
          <h2>Assessment Complete</h2>
        </div>

        <div className="result-images-grid">
          <div className="result-image-item">
            <p className="result-image-label">Side View</p>
            <img src={sideImage} alt="Side view" />
          </div>
          <div className="result-image-item">
            <p className="result-image-label">Top View</p>
            <img src={topImage} alt="Top view" />
          </div>
        </div>

        <div className="score-display">
          <div className="score-label">Body Condition Score</div>
          <div className="score-value" style={{ color: result.color }}>
            {score}/9
          </div>
          <div className="score-category" style={{ color: result.color }}>
            {result.category}
          </div>
        </div>

        <div className="score-scale">
          <div className="scale-bar">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <div
                key={num}
                className={`scale-segment ${score === num ? 'active' : ''}`}
                style={score === num ? { backgroundColor: result.color } : {}}
              />
            ))}
          </div>
          <div className="scale-labels">
            <span>Underweight</span>
            <span>Ideal</span>
            <span>Obese</span>
          </div>
        </div>

        <div className="result-description">
          <p>{result.description}</p>
        </div>

        <div className="recommendations">
          <h3>Recommendations</h3>
          <ul>
            {result.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="disclaimer">
          <p>
            <strong>Important:</strong> This assessment is for educational purposes only
            and should not replace professional veterinary advice. Please consult
            your veterinarian for a comprehensive health evaluation.
          </p>
        </div>

        <div className="result-actions">
          <button onClick={onViewGuide} className="outline">
            View BCS Guide
          </button>
          <button onClick={onReset} className="primary-button">
            New Assessment
          </button>
        </div>
      </div>
    </div>
  )
}

export default BCSResult
