import { useState } from 'react'
import './BCSAssessment.css'

const assessmentQuestions = [
  {
    id: 'ribs',
    question: 'When you touch your dog\'s ribs, what do you feel?',
    options: [
      { value: 1, label: 'Ribs are very prominent and easily visible', score: 1 },
      { value: 2, label: 'Ribs are easily felt with minimal pressure', score: 2 },
      { value: 3, label: 'Ribs are felt with slight pressure', score: 3 },
      { value: 4, label: 'Ribs are difficult to feel under fat layer', score: 4 },
      { value: 5, label: 'Ribs cannot be felt under thick fat layer', score: 5 }
    ]
  },
  {
    id: 'waist',
    question: 'Looking at your dog from above, how would you describe their waist?',
    options: [
      { value: 1, label: 'Waist is extremely pronounced and narrow', score: 1 },
      { value: 2, label: 'Waist is clearly visible and well-defined', score: 2 },
      { value: 3, label: 'Waist is visible but not overly pronounced', score: 3 },
      { value: 4, label: 'Little to no visible waist', score: 4 },
      { value: 5, label: 'No waist visible, sides bulge outward', score: 5 }
    ]
  },
  {
    id: 'abdomen',
    question: 'Looking at your dog from the side, how does their abdomen appear?',
    options: [
      { value: 1, label: 'Abdomen is severely tucked up', score: 1 },
      { value: 2, label: 'Abdomen is clearly tucked up', score: 2 },
      { value: 3, label: 'Abdomen is slightly tucked up', score: 3 },
      { value: 4, label: 'Abdomen is level with chest', score: 4 },
      { value: 5, label: 'Abdomen hangs below chest line', score: 5 }
    ]
  }
]

const BCSAssessment = ({ image, onComplete, onRetake }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})

  const handleAnswer = (questionId, score) => {
    const newAnswers = { ...answers, [questionId]: score }
    setAnswers(newAnswers)

    if (currentQuestion < assessmentQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 300)
    } else {
      // Calculate final score
      const scores = Object.values(newAnswers)
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

      // Convert to 1-9 scale (more standard in veterinary medicine)
      const bcsScore = Math.round(avgScore * 1.8)

      setTimeout(() => {
        onComplete(bcsScore)
      }, 300)
    }
  }

  const question = assessmentQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100

  return (
    <div className="bcs-assessment">
      <div className="assessment-header">
        <button onClick={onRetake} className="back-button">
          ← Change Photo
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">
          Question {currentQuestion + 1} of {assessmentQuestions.length}
        </p>
      </div>

      <div className="image-preview">
        <img src={image} alt="Your dog" />
      </div>

      <div className="question-container">
        <h2>{question.question}</h2>
        <div className="options-list">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(question.id, option.score)}
              className={`option-button ${answers[question.id] === option.score ? 'selected' : ''}`}
            >
              <span className="option-number">{option.value}</span>
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BCSAssessment
