document.addEventListener('DOMContentLoaded', function() {
  // njibou el 3anaser ml interface
  const extractBtn = document.getElementById('extractBtn');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const moodleBtn = document.getElementById('moodleBtn');
  const customText = document.getElementById('customText');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const quizResults = document.getElementById('quizResults');
  const questionsContainer = document.getElementById('questions');

  // ki tclicki 3la "extract", njarbo n5dhou el texte el asly ml page
  extractBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "extractText"}, function(response) {
        // ken el content script mouch mawjouda, nwarri message
        if (chrome.runtime.lastError) {
          alert("ma najmtch n5ou el texte ml page hedhi. 3awed 3mil refresh wala at2akked elli enti mouch fi page mta3 chrome (ki chrome://extensions).");
          return;
        }
        // ken l9ina texte, n7otouh fil textarea, ken la nwarri message
        if (response && response.text) {
          customText.value = response.text;
        } else {
          alert("ma fama hata texte ynajm yet7al ml page hedhi.");
        }
      });
    });
  });

  // ki tclicki 3la "7addir el quiz", ncheckiw el input w nb3thou lil background
  generateBtn.addEventListener('click', async function() {
    const text = customText.value.trim();
    
    // ken ma fama chay, ma na3mlou chay
    if (!text) {
      alert('extracti texte ml page wala lsa9 texte mta3ek.');
      return;
    }

    // na5dhou les options mta3 el quiz ml interface
    const options = {
      mcq: document.getElementById('mcqOption').checked,
      trueFalse: document.getElementById('trueFalseOption').checked,
      shortAnswer: document.getElementById('shortAnswerOption').checked,
      difficulty: document.getElementById('difficultyLevel').value,
      numQuestions: document.getElementById('numQuestions').value
    };

    // lazem au moins wa7ed men types mta3 les questions
    if (!options.mcq && !options.trueFalse && !options.shortAnswer) {
      alert('ikhtar au moins type wa7ed mta3 les questions.');
      return;
    }

    // nwarri spinner w n5abi el results waqt el generation
    loadingIndicator.classList.remove('hidden');
    quizResults.classList.add('hidden');

    try {
      // nb3thou lil background bech yjib el quiz
      chrome.runtime.sendMessage({
        action: "generateQuiz",
        text: text,
        options: options
      }, function(response) {
        loadingIndicator.classList.add('hidden');
        
        // ken raja3na questions, n'affichiw, ken la nwarri erreur
        if (response && response.questions) {
          displayQuestions(response.questions);
          quizResults.classList.remove('hidden');

          // n5azznou el quiz fil storage bech nesta3mlouh fil export
          chrome.storage.local.set({currentQuiz: response.questions});
        } else {
          alert('ma najmtch na3ml el quiz. 7awel b texte okher wala options okhra.');
        }
      });
    } catch (error) {
      loadingIndicator.classList.add('hidden');
      alert('9a3ed sar mochkel: ' + error.message);
    }
  });

  // n'affichiw les questions fil interface
  function displayQuestions(questions) {
    questionsContainer.innerHTML = '';

    questions.forEach((question, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question';

      let questionHTML = `<p><strong>S${index + 1}:</strong> ${question.text}</p>`;

      // n'affichiw les options fil MCQ, reponse fil True/False, wala reponse model fil short answer
      if (question.type === 'mcq') {
        questionHTML += '<ul>';
        question.options.forEach((option, i) => {
          const isCorrect = option === question.answer ? ' (✓)' : '';
          questionHTML += `<li>${option}${isCorrect}</li>`;
        });
        questionHTML += '</ul>';
      } else if (question.type === 'true_false') {
        questionHTML += `<p>el ijaba: ${question.answer}</p>`;
      } else if (question.type === 'short_answer') {
        questionHTML += `<p>ijaba model: ${question.answer}</p>`;
      }

      questionHTML += `<p><em>el sou3ba: ${question.difficulty}</em></p>`;
      questionDiv.innerHTML = questionHTML;
      questionsContainer.appendChild(questionDiv);
    });
  }

  // nansakhou el quiz fil clipboard texte
  copyBtn.addEventListener('click', function() {
    chrome.storage.local.get(['currentQuiz'], function(result) {
      if (result.currentQuiz) {
        const quizText = formatQuizForText(result.currentQuiz);
        navigator.clipboard.writeText(quizText)
          .then(() => alert('el quiz tensa5!'))
          .catch(err => alert('ma najmtch nansakh: ' + err));
      }
    });
  });

  // na3mlou download lil quiz fil JSON
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

  // na3mlou export lil quiz fil Moodle XML
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

  // na7dher el quiz texte bech nansakh
  function formatQuizForText(questions) {
    let text = "el quiz el moujoud\n\n";
    
    questions.forEach((question, index) => {
      text += `so2al ${index + 1}: ${question.text}\n`;
      
      if (question.type === 'mcq') {
        question.options.forEach((option, i) => {
          const marker = option === question.answer ? "* " : "  ";
          text += `${marker}${String.fromCharCode(97 + i)}. ${option}\n`;
        });
      } else if (question.type === 'true_false') {
        text += `el ijaba: ${question.answer}\n`;
      } else if (question.type === 'short_answer') {
        text += `ijaba model: ${question.answer}\n`;
      }
      
      text += `el sou3ba: ${question.difficulty}\n\n`;
    });
    
    return text;
  }

  // na7dher el quiz fil Moodle XML
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
