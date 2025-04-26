// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "generateQuiz") {
    generateQuiz(request.text, request.options)
      .then(questions => sendResponse({questions: questions}))
      .catch(error => sendResponse({error: error.message}));
    return true; // Required for async response
  }
});

// Main function to generate quiz
async function generateQuiz(text, options) {
  // Step 1: Preprocess the text
  const processedText = preprocessText(text);
  
  // Step 2: Generate questions based on options
  let questions = [];
  let totalQuestions = parseInt(options.numQuestions);
  let questionDistribution = calculateQuestionDistribution(options, totalQuestions);
  
  // Step 3: Generate questions of each type
  if (questionDistribution.mcq > 0) {
    const mcqQuestions = await generateMCQs(processedText, options.difficulty, questionDistribution.mcq);
    questions = questions.concat(mcqQuestions);
  }
  
  if (questionDistribution.trueFalse > 0) {
    const tfQuestions = await generateTrueFalseQuestions(processedText, options.difficulty, questionDistribution.trueFalse);
    questions = questions.concat(tfQuestions);
  }
  
  if (questionDistribution.shortAnswer > 0) {
    const saQuestions = await generateShortAnswerQuestions(processedText, options.difficulty, questionDistribution.shortAnswer);
    questions = questions.concat(saQuestions);
  }
  
  // Step 4: Filter and rank questions
  questions = filterAndRankQuestions(questions);
  
  return questions;
}

// Text preprocessing function
function preprocessText(text) {
  // Remove excessive whitespace
  let processed = text.replace(/\s+/g, ' ');
  
  // Split into sentences
  const sentences = processed.match(/[^.!?]+[.!?]+/g) || [];
  
  // Filter out very short sentences and join paragraphs
  return sentences
    .filter(sentence => sentence.trim().split(' ').length > 5)
    .join(' ');
}

// Calculate distribution of question types
function calculateQuestionDistribution(options, totalQuestions) {
  const enabledTypes = [];
  
  if (options.mcq) enabledTypes.push('mcq');
  if (options.trueFalse) enabledTypes.push('true_false');
  if (options.shortAnswer) enabledTypes.push('short_answer');
  
  const typeCount = enabledTypes.length;
  const baseAmount = Math.floor(totalQuestions / typeCount);
  const remainder = totalQuestions % typeCount;
  
  const distribution = {
    mcq: 0,
    trueFalse: 0,
    shortAnswer: 0
  };
  
  enabledTypes.forEach((type, index) => {
    if (type === 'mcq') distribution.mcq = baseAmount + (index < remainder ? 1 : 0);
    if (type === 'true_false') distribution.trueFalse = baseAmount + (index < remainder ? 1 : 0);
    if (type === 'short_answer') distribution.shortAnswer = baseAmount + (index < remainder ? 1 : 0);
  });
  
  return distribution;
}

// Generate Multiple Choice Questions
async function generateMCQs(text, difficulty, count) {
  try {
    const prompt = buildPromptForMCQ(text, difficulty, count);
    const response = await callLLMApi(prompt);
    return parseMCQResponse(response, difficulty);
  } catch (error) {
    console.error("Error generating MCQs:", error);
    return [];
  }
}

// Generate True/False Questions
async function generateTrueFalseQuestions(text, difficulty, count) {
  try {
    const prompt = buildPromptForTF(text, difficulty, count);
    const response = await callLLMApi(prompt);
    return parseTFResponse(response, difficulty);
  } catch (error) {
    console.error("Error generating True/False questions:", error);
    return [];
  }
}

// Generate Short Answer Questions
async function generateShortAnswerQuestions(text, difficulty, count) {
  try {
    const prompt = buildPromptForSA(text, difficulty, count);
    const response = await callLLMApi(prompt);
    return parseSAResponse(response, difficulty);
  } catch (error) {
    console.error("Error generating Short Answer questions:", error);
    return [];
  }
}

// Filter and rank questions based on quality
function filterAndRankQuestions(questions) {
  // For now, we'll just return all questions
  // In a more sophisticated version, we could implement quality scoring
  return questions;
}

// Function to build MCQ generation prompt
function buildPromptForMCQ(text, difficulty, count) {
  return `Generate ${count} multiple-choice questions about the following text. 
Difficulty level: ${difficulty}
For each question:
- Create a clear, concise question
- Provide 4 options with exactly one correct answer
- Format as JSON array with fields: text, options (array), answer (correct option text)

Text: ${text.substring(0, 3000)}`;
}

// Function to build True/False generation prompt
function buildPromptForTF(text, difficulty, count) {
  return `Generate ${count} true/false questions about the following text.
Difficulty level: ${difficulty}
For each question:
- Create a statement that is clearly true or false based on the text
- Format as JSON array with fields: text, answer (string "True" or "False")

Text: ${text.substring(0, 3000)}`;
}

// Function to build Short Answer generation prompt
function buildPromptForSA(text, difficulty, count) {
  return `Generate ${count} short answer questions about the following text.
Difficulty level: ${difficulty}
For each question:
- Create a question that can be answered in a few words or sentences
- Provide a sample correct answer
- Format as JSON array with fields: text, answer

Text: ${text.substring(0, 3000)}`;
}

// Parse MCQ response from LLM
function parseMCQResponse(response, difficulty) {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\[.*\]/s);
    if (!jsonMatch) return [];
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.map(q => ({
      ...q,
      type: 'mcq',
      difficulty: difficulty
    }));
  } catch (error) {
    console.error("Error parsing MCQ response:", error);
    return [];
  }
}

// Parse True/False response from LLM
function parseTFResponse(response, difficulty) {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\[.*\]/s);
    if (!jsonMatch) return [];
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.map(q => ({
      ...q,
      type: 'true_false',
      difficulty: difficulty
    }));
  } catch (error) {
    console.error("Error parsing True/False response:", error);
    return [];
  }
}

// Parse Short Answer response from LLM
function parseSAResponse(response, difficulty) {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\[.*\]/s);
    if (!jsonMatch) return [];
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.map(q => ({
      ...q,
      type: 'short_answer',
      difficulty: difficulty
    }));
  } catch (error) {
    console.error("Error parsing Short Answer response:", error);
    return [];
  }
}

// Function to call LLM API (OpenAI)
async function callLLMApi(prompt) {
  // In a real implementation, this would call an external API
  // For demo purposes, we'll simulate responses
  return simulateApiResponse(prompt);
}

// Simulate API responses for demo purposes
function simulateApiResponse(prompt) {
  if (prompt.includes('multiple-choice questions')) {
    return `[
      {
        "text": "What is the main purpose of text processing in a quiz generation system?",
        "options": [
          "To extract key facts and concepts",
          "To increase text length",
          "To translate text to different languages",
          "To reduce text readability"
        ],
        "answer": "To extract key facts and concepts"
      },
      {
        "text": "Which NLP technique involves breaking text into meaningful segments?",
        "options": [
          "Text summarization",
          "Text segmentation",
          "Machine translation",
          "Named entity recognition"
        ],
        "answer": "Text segmentation"
      }
    ]`;
  } else if (prompt.includes('true/false questions')) {
    return `[
      {
        "text": "Text processing is an essential step in quiz generation.",
        "answer": "True"
      },
      {
        "text": "Question generation can only be done manually, not automatically.",
        "answer": "False"
      }
    ]`;
  } else if (prompt.includes('short answer questions')) {
    return `[
      {
        "text": "Name two transformer models that can be used for question generation.",
        "answer": "T5 and GPT"
      },
      {
        "text": "What technique can be used to generate wrong answers for MCQs?",
        "answer": "Word embeddings or synonym mining"
      }
    ]`;
  }
  
  return '[]';
}
