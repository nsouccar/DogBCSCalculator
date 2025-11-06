import './BCSGuide.css'

const bcsScores = [
  {
    score: 1,
    category: 'Emaciated',
    description: 'Ribs, spine, and pelvic bones are easily visible. No body fat. Obvious loss of muscle mass.',
    visual: 'Severe hourglass shape when viewed from above'
  },
  {
    score: 2,
    category: 'Very Thin',
    description: 'Ribs, spine, and pelvic bones are easily visible. Minimal body fat. Slight muscle mass loss.',
    visual: 'Pronounced hourglass shape when viewed from above'
  },
  {
    score: 3,
    category: 'Thin',
    description: 'Ribs are easily felt. Top of spine visible. Pelvic bones becoming prominent. Obvious waist.',
    visual: 'Clear hourglass shape when viewed from above'
  },
  {
    score: 4,
    category: 'Underweight',
    description: 'Ribs easily felt with minimal fat covering. Waist easily noted when viewed from above. Abdominal tuck evident.',
    visual: 'Noticeable waist when viewed from above'
  },
  {
    score: 5,
    category: 'Ideal',
    description: 'Ribs palpable without excess fat. Waist observed behind ribs. Abdomen tucked up when viewed from side.',
    visual: 'Well-proportioned waist when viewed from above'
  },
  {
    score: 6,
    category: 'Overweight',
    description: 'Ribs palpable with slight excess fat. Waist discernible but not prominent. Abdominal tuck apparent.',
    visual: 'Slight waist when viewed from above'
  },
  {
    score: 7,
    category: 'Heavy',
    description: 'Ribs difficult to feel under fat layer. Fat deposits over lumbar area. Waist barely visible. Abdominal tuck may be present.',
    visual: 'Little to no waist when viewed from above'
  },
  {
    score: 8,
    category: 'Obese',
    description: 'Ribs not palpable under heavy fat. Heavy fat deposits over lumbar area and tail base. No waist. No abdominal tuck.',
    visual: 'Back is broadened, no waist visible from above'
  },
  {
    score: 9,
    category: 'Severely Obese',
    description: 'Massive fat deposits over thorax, spine, and tail base. Waist absent. Distended abdomen. No abdominal tuck.',
    visual: 'Massive fat deposits, abdomen distended'
  }
]

const BCSGuide = ({ onClose }) => {
  return (
    <div className="bcs-guide">
      <div className="guide-header">
        <button onClick={onClose} className="close-button">
          ← Back
        </button>
        <h2>BCS Guide</h2>
        <p>Understanding the 9-Point Body Condition Score Scale</p>
      </div>

      <div className="guide-content">
        <div className="guide-intro">
          <h3>How to Use This Guide</h3>
          <p>
            The Body Condition Score (BCS) is a standardized method for evaluating
            your dog's body composition. A score of 5 is considered ideal for most dogs.
          </p>
          <div className="guide-tips">
            <h4>Key Assessment Points:</h4>
            <ul>
              <li><strong>Ribs:</strong> Feel along your dog's ribcage</li>
              <li><strong>Waist:</strong> Look from above for an hourglass shape</li>
              <li><strong>Abdomen:</strong> View from the side for a tuck</li>
            </ul>
          </div>
        </div>

        <div className="score-reference">
          {bcsScores.map((item) => (
            <div
              key={item.score}
              className={`score-card ${item.score === 5 ? 'ideal' : ''}`}
            >
              <div className="score-header">
                <div className={`score-badge score-${item.score}`}>
                  {item.score}
                </div>
                <div className="score-info">
                  <h3>{item.category}</h3>
                  {item.score === 5 && <span className="ideal-badge">Ideal</span>}
                </div>
              </div>
              <p className="score-description">{item.description}</p>
              <div className="visual-indicator">
                <strong>Visual:</strong> {item.visual}
              </div>
            </div>
          ))}
        </div>

        <div className="guide-footer-note">
          <h3>Remember me please please</h3>
          <p>
            Different breeds may have slightly different ideal weights and body shapes.
            Always consult with your veterinarian for personalized advice about your
            dog's optimal body condition.
          </p>
        </div>
      </div>

      <div className="guide-actions">
        <button onClick={onClose} className="primary-button">
          Close Guide
        </button>
      </div>
    </div>
  )
}

export default BCSGuide
