import Anthropic from '@anthropic-ai/sdk'

class ClaudeBCSService {
  constructor() {
    this.client = null
    this.isLoaded = false
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  }

  /**
   * Initialize the Claude API client
   */
  async load() {
    if (this.isLoaded) return

    try {
      if (!this.apiKey || this.apiKey === 'your_api_key_here') {
        throw new Error('Anthropic API key not configured. Please add your API key to the .env file.')
      }

      console.log('Initializing Claude API client...')
      this.client = new Anthropic({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true // Enable browser usage
      })
      this.isLoaded = true
      console.log('Claude API client initialized successfully')
    } catch (error) {
      console.error('Error initializing Claude API:', error)
      throw error
    }
  }

  /**
   * Predict BCS from image using Claude API
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

    try {
      console.log('Sending image to Claude API for BCS analysis...')

      // Extract base64 data and media type
      const matches = base64Image.match(/^data:(.+);base64,(.+)$/)
      if (!matches) {
        throw new Error('Invalid base64 image format')
      }

      const mediaType = matches[1]
      const base64Data = matches[2]

      // Call Claude API with vision
      const message = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data
                }
              },
              {
                type: 'text',
                text: `Please analyze this image and provide a Body Condition Score (BCS) for the dog shown. The BCS scale is from 1-9 where:

1-3: Underweight (ribs, spine, and hip bones very visible)
4-5: Ideal weight (ribs palpable with slight fat cover, visible waist, abdominal tuck)
6-7: Overweight (ribs difficult to feel, waist barely visible, minimal abdominal tuck)
8-9: Obese (ribs not palpable, no waist, abdomen distended)

Please respond in the following JSON format:
{
  "bcsScore": <number 1-9>,
  "confidence": <number 0-1>,
  "isDogDetected": <boolean>,
  "waistDefinition": <number 0-1>,
  "bodyShape": <number 0-1>,
  "overallCondition": <number 0-1>,
  "recommendations": [<array of 2-3 recommendation strings>],
  "reasoning": "<brief explanation of the assessment>"
}

Provide realistic confidence based on image quality and visibility of key features. Be honest if the image quality or angle makes assessment difficult.`
              }
            ]
          }
        ]
      })

      console.log('Received response from Claude API')

      // Parse Claude's response
      const responseText = message.content[0].text
      console.log('Claude response:', responseText)

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not parse JSON response from Claude')
      }

      const analysis = JSON.parse(jsonMatch[0])

      // Format response to match existing interface
      return {
        bcsScore: analysis.bcsScore,
        confidence: analysis.confidence,
        analysis: {
          waistDefinition: analysis.waistDefinition,
          bodyShape: analysis.bodyShape,
          overallCondition: analysis.overallCondition,
          isDogDetected: analysis.isDogDetected,
          detectedObjects: analysis.isDogDetected
            ? [{ className: 'Dog', probability: analysis.confidence }]
            : []
        },
        recommendations: analysis.recommendations,
        reasoning: analysis.reasoning
      }
    } catch (error) {
      console.error('Error during Claude API prediction:', error)

      // Provide helpful error messages
      if (error.message?.includes('API key')) {
        throw new Error('API key configuration error. Please check your .env file.')
      } else if (error.status === 401) {
        throw new Error('Invalid API key. Please check your Anthropic API key.')
      } else if (error.status === 429) {
        throw new Error('API rate limit exceeded. Please try again in a moment.')
      } else if (error.message?.includes('JSON')) {
        throw new Error('Failed to parse AI response. Please try again.')
      } else {
        throw new Error(`AI analysis failed: ${error.message || 'Unknown error'}`)
      }
    }
  }
}

// Create singleton instance
const claudeService = new ClaudeBCSService()

export default claudeService
