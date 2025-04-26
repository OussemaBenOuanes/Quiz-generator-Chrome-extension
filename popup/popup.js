document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const extractBtn = document.getElementById('extractBtn');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const moodleBtn = document.getElementById('moodleBtn');
  const customText = document.getElementById('customText');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const quizResults = document.getElementById('quizResults');
  const questionsContainer = document.getElementById('questions');

  // Extract text from current page
  extractBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "extractText"}, function(response) {
        if (chrome.runtime.lastError) {
          alert("Could not extract text from this page. Try refreshing the page or make sure you're not on a Chrome internal page (like chrome://extensions).");
          return;
        }
        if (response && response.text) {
          customText.value = response.text;
        } else {
          alert("No extractable text found on this page.");
        }
      });
    });
  });

  // Generate quiz
  generateBtn.addEventListener('click', async function() {
    const text = customText.value.trim();
    
    if (!text) {
      alert('Please extract text from the page or paste your own text.');
      return;
    }

    // Get quiz options
    const options = {
      mcq: document.getElementById('mcqOption').checked,
      trueFalse: document.getElementById('trueFalseOption').checked,
      shortAnswer: document.getElementById('shortAnswerOption').checked,
      difficulty: document.getElementById('difficultyLevel').value,
      numQuestions: document.getElementById('numQuestions').value
    };

    // Validate at least one question type is selected
    if (!options.mcq && !options.trueFalse && !options.shortAnswer) {
      alert('Please select at least one question type.');
      return;
    }

    // Show loading indicator
    loadingIndicator.classList.remove('hidden');
    quizResults.classList.add('hidden');

    try {
      // Send message to background script to generate quiz
      chrome.runtime.sendMessage({
        action: "generateQuiz",
        text: text,
        options: options
      }, function(response) {
        loadingIndicator.classList.add('hidden');
        
        if (response && response.questions) {
          displayQuestions(response.questions);
          quizResults.classList.remove('hidden');

          // Store the quiz in local storage for export functions
          chrome.storage.local.set({currentQuiz: response.questions});
        } else {
          alert('Failed to generate quiz. Please try again with different text or options.');
        }
      });
    } catch (error) {
      loadingIndicator.classList.add('hidden');
      alert('An error occurred: ' + error.message);
    }
  });

  // Display questions in the popup
  function displayQuestions(questions) {
    questionsContainer.innerHTML = '';

    questions.forEach((question, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question';

      let questionHTML = `<p><strong>Q${index + 1}:</strong> ${question.text}</p>`;

      if (question.type === 'mcq') {
        questionHTML += '<ul>';
        question.options.forEach((option, i) => {
          const isCorrect = option === question.answer ? ' (✓)' : '';
          questionHTML += `<li>${option}${isCorrect}</li>`;
        });
        questionHTML += '</ul>';
      } else if (question.type === 'true_false') {
        questionHTML += `<p>Answer: ${question.answer}</p>`;
      } else if (question.type === 'short_answer') {
        questionHTML += `<p>Sample Answer: ${question.answer}</p>`;
      }

      questionHTML += `<p><em>Difficulty: ${question.difficulty}</em></p>`;
      questionDiv.innerHTML = questionHTML;
      questionsContainer.appendChild(questionDiv);
    });
  }

  // Copy quiz to clipboard
  copyBtn.addEventListener('click', function() {
    chrome.storage.local.get(['currentQuiz'], function(result) {
      if (result.currentQuiz) {
        const quizText = formatQuizForText(result.currentQuiz);
        navigator.clipboard.writeText(quizText)
          .then(() => alert('Quiz copied to clipboard!'))
          .catch(err => alert('Failed to copy: ' + err));
      }
    });
  });

  // Download quiz as JSON
  downloadBtn.addEventListener('click', function() {
    chrome.storage.local.get(['currentQuiz'], function(result) {
      if (result.currentQuiz) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.currentQuiz, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "quiz.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    });
  });

  // Export for Moodle
  moodleBtn.addEventListener('click', function() {
    chrome.storage.local.get(['currentQuiz'], function(result) {
      if (result.currentQuiz) {
        const moodleXML = formatQuizForMoodle(result.currentQuiz);
        const dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(moodleXML);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "quiz_moodle.xml");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    });
  });

  // Format quiz for plain text
  function formatQuizForText(questions) {
    let text = "GENERATED QUIZ\n\n";
    
    questions.forEach((question, index) => {
      text += `Question ${index + 1}: ${question.text}\n`;
      
      if (question.type === 'mcq') {
        question.options.forEach((option, i) => {
          const marker = option === question.answer ? "* " : "  ";
          text += `${marker}${String.fromCharCode(97 + i)}. ${option}\n`;
        });
      } else if (question.type === 'true_false') {
        text += `Answer: ${question.answer}\n`;
      } else if (question.type === 'short_answer') {
        text += `Sample Answer: ${question.answer}\n`;
      }
      
      text += `Difficulty: ${question.difficulty}\n\n`;
    });
    
    return text;
  }

  // Format quiz for Moodle XML
  function formatQuizForMoodle(questions) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
    
    questions.forEach((question) => {
      if (question.type === 'mcq') {
        xml += '  <question type="multichoice">\n';
        xml += `    <name><text>${question.text}</text></name>\n`;
        xml += `    <questiontext><text>${question.text}</text></questiontext>\n`;
        xml += '    <shuffleanswers>true</shuffleanswers>\n';
        xml += '    <single>true</single>\n';
        
        question.options.forEach((option) => {
          const fraction = option === question.answer ? '100' : '0';
          xml += '    <answer fraction="' + fraction + '">\n';
          xml += `      <text>${option}</text>\n`;
          xml += '    </answer>\n';
        });
        
      } else if (question.type === 'true_false') {
        xml += '  <question type="truefalse">\n';
        xml += `    <name><text>${question.text}</text></name>\n`;
        xml += `    <questiontext><text>${question.text}</text></questiontext>\n`;
        
        const isTrue = question.answer.toLowerCase() === 'true';
        xml += `    <answer fraction="${isTrue ? '100' : '0'}"><text>true</text></answer>\n`;
        xml += `    <answer fraction="${isTrue ? '0' : '100'}"><text>false</text></answer>\n`;
        
      } else if (question.type === 'short_answer') {
        xml += '  <question type="shortanswer">\n';
        xml += `    <name><text>${question.text}</text></name>\n`;
        xml += `    <questiontext><text>${question.text}</text></questiontext>\n`;
        xml += '    <answer fraction="100">\n';
        xml += `      <text>${question.answer}</text>\n`;
        xml += '    </answer>\n';
      }
      
      xml += '  </question>\n';
    });
    
    xml += '</quiz>';
    return xml;
  }
});
