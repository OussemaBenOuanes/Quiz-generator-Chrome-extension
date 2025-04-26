/**
 * Question generation module for the quiz generator
 */
class QuestionGenerator {
  /**
   * Generate multiple choice questions
   * @param {string} text - The processed text
   * @param {string} difficulty - The difficulty level (easy, medium, hard)
   * @param {number} count - Number of questions to generate
   * @returns {Promise<Array>} - Array of generated MCQ objects
   */
  static async generateMCQs(text, difficulty, count) {
    try {
      const prompt = this._buildMCQPrompt(text, difficulty, count);
      const response = await this._callLLMAPI(prompt);
      return this._parseMCQResponse(response, difficulty);
    } catch (error) {
      console.error('Error generating MCQs:', error);
      return [];
    }
  }
  
  /**
   * Generate true/false questions
   * @param {string} text - The processed text
   * @param {string} difficulty - The difficulty level (easy, medium, hard)
   * @param {number} count - Number of questions to generate
   * @returns {Promise<Array>} - Array of generated true/false question objects
   */
  static async generateTrueFalseQuestions(text, difficulty, count) {
    try {
      const prompt = this._buildTrueFalsePrompt(text, difficulty, count);
      const response = await this._callLLMAPI(prompt);
      return this._parseTrueFalseResponse(response, difficulty);
    } catch (error) {
      console.error('Error generating true/false questions:', error);
      return [];
    }
  }
  
  /**
   * Generate short answer questions
   * @param {string} text - The processed text
   * @param {string} difficulty - The difficulty level (easy, medium, hard)
   * @param {number} count - Number of questions to generate
   * @returns {Promise<Array>} - Array of generated short answer question objects
   */
  static async generateShortAnswerQuestions(text, difficulty, count) {
    try {
      const prompt = this._buildShortAnswerPrompt(text, difficulty, count);
      const response = await this._callLLMAPI(prompt);
      return this._parseShortAnswerResponse(response, difficulty);
    } catch (error) {
      console.error('Error generating short answer questions:', error);
      return [];
    }
  }
  
  /**
   * Build prompt for MCQ generation
   * @private
   */
  static _buildMCQPrompt(text, difficulty, count) {
    return `Generate ${count} multiple-choice questions based on the following text.
Difficulty level: ${difficulty}
Each question should have 4 options with exactly one correct answer.
Format the response as a JSON array of objects with the following structure:
[
  {
    "text": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct option text"
  }
]

Text: ${text.substring(0, 3000)}`;
  }
  
  /**
   * Build prompt for true/false question generation
   * @private
   */
  static _buildTrueFalsePrompt(text, difficulty, count) {
    return `Generate ${count} true/false questions based on the following text.
Difficulty level: ${difficulty}
Format the response as a JSON array of objects with the following structure:
[
  {
    "text": "Statement that is either true or false",
    "answer": "True" or "False"
  }
]

Text: ${text.substring(0, 3000)}`;
  }
  
  /**
   * Build prompt for short answer question generation
   * @private
   */
  static _buildShortAnswerPrompt(text, difficulty, count) {
    return `Generate ${count} short answer questions based on the following text.
Difficulty level: ${difficulty}
Each question should be answerable with a brief phrase or sentence.
Format the response as a JSON array of objects with the following structure:
[
  {
    "text": "Question text",
    "answer": "Sample answer"
  }
]

Text: ${text.substring(0, 3000)}`;
  }
  
  /**
   * Call the Language Model API
   * @private
   */
  static async _callLLMAPI(prompt) {
    // In a real implementation, this would call an actual API
    // For demo purposes, we'll use the mock implementation
    return this._mockLLMResponse(prompt);
  }
  
  /**
   * Parse MCQ response from LLM
   * @private
   */
  static _parseMCQResponse(response, difficulty) {
    try {
      const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) return [];
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map(q => ({
        ...q,
        type: 'mcq',
        difficulty: difficulty
      }));
    } catch (error) {
      console.error('Error parsing MCQ response:', error);
      return [];
    }
  }
  
  /**
   * Parse true/false response from LLM
   * @private
   */
  static _parseTrueFalseResponse(response, difficulty) {
    try {
      const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) return [];
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map(q => ({
        ...q,
        type: 'true_false',
        difficulty: difficulty
      }));
    } catch (error) {
      console.error('Error parsing true/false response:', error);
      return [];
    }
  }
  
  /**
   * Parse short answer response from LLM
   * @private
   */
  static _parseShortAnswerResponse(response, difficulty) {
    try {
      const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) return [];
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map(q => ({
        ...q,
        type: 'short_answer',
        difficulty: difficulty
      }));
    } catch (error) {
      console.error('Error parsing short answer response:', error);
      return [];
    }
  }
  
  /**
   * Mock LLM response for demo purposes
   * @private
   */
  static _mockLLMResponse(prompt) {
    if (prompt.includes('multiple-choice questions')) {
      return `[
        {
          "text": "What is the main advantage of using transformers for question generation?",
          "options": [
            "They require less computational power",
            "They generate more contextually relevant questions",
            "They are easier to implement",
            "They don't require training data"
          ],
          "answer": "They generate more contextually relevant questions"
        },
        {
          "text": "Which technique is commonly used to generate distractors for MCQs?",
          "options": [
            "Word embeddings",
            "Decision trees",
            "Random selection",
            "Manual creation only"
          ],
          "answer": "Word embeddings"
        }
      ]`;
    } else if (prompt.includes('true/false questions')) {
      return `[
        {
          "text": "Natural Language Processing is used to extract key facts from text for quiz generation.",
          "answer": "True"
        },
        {
          "text": "All quiz questions must be validated by human reviewers before use.",
          "answer": "False"
        }
      ]`;
    } else if (prompt.includes('short answer questions')) {
      return `[
        {
          "text": "What are two types of transformers mentioned that can be used for question generation?",
          "answer": "T5 and GPT"
        },
        {
          "text": "What is used to filter out poor quality questions in a quiz generation system?",
          "answer": "Human-in-the-loop feedback or LLM-based scoring"
        }
      ]`;
    }
    
    return '[]';
  }
}

// Export the QuestionGenerator class
if (typeof module !== 'undefined') {
  module.exports = QuestionGenerator;
}
