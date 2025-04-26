# QuizGen Chrome Extension

QuizGen is a Chrome extension that automatically generates quizzes from text content on any webpage. It uses Natural Language Processing (NLP) techniques to create multiple-choice questions, true/false questions, and short-answer questions based on the content.

## Features

- Extract text from any webpage or paste your own text
- Generate different types of quiz questions:
  - Multiple-choice questions
  - True/False questions
  - Short-answer questions
- Adjust difficulty level (Easy, Medium, Hard)
- Customize the number of questions
- Export questions in different formats:
  - Copy to clipboard
  - Download as JSON
  - Export for Moodle

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The QuizGen extension icon should appear in your browser toolbar

## Usage

1. Navigate to a webpage with educational content
2. Click on the QuizGen extension icon in the toolbar
3. Choose "Extract from Current Page" to get text from the current webpage, or paste your own text
4. Select the types of questions you want to generate
5. Adjust the difficulty level and number of questions
6. Click "Generate Quiz"
7. Review the generated questions
8. Use the export buttons to save or share your quiz

## Technical Details

The extension uses a client-side architecture to process text and generate questions:

1. **Text Processing**:
   - Extracts meaningful text from webpages
   - Cleans and segments the text into processable chunks

2. **Question Generation**:
   - Uses prompt engineering techniques to generate contextually relevant questions
   - Creates different question types with appropriate distractors for MCQs

3. **Quality Control**:
   - Filters out low-quality or ambiguous questions
   - Ranks questions based on relevance and clarity

## Development and Extension

To extend or modify this extension:

1. Modify `popup.js` to change the user interface behavior
2. Edit `contentScript.js` to change how text is extracted from webpages
3. Update `background.js` to modify the question generation logic
4. Add new question types by extending the `questionGenerator.js` file

## License

MIT License

## Future Improvements

- Integration with external APIs for more sophisticated NLP processing
- Support for additional question types (matching, fill-in-the-blanks)
- Multilingual support
- User accounts to save and share quizzes
- Analytics to improve question quality over time
