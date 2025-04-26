/**
 * Text processing module for the quiz generator
 */
class TextProcessor {
  /**
   * Process and clean the input text
   * @param {string} text - The raw input text
   * @returns {string} - The processed text
   */
  static cleanText(text) {
    if (!text) return '';
    
    // Remove extra whitespace
    let cleaned = text.replace(/\s+/g, ' ');
    
    // Remove special characters but keep punctuation
    cleaned = cleaned.replace(/[^\w\s.,!?:;()'"]/g, '');
    
    return cleaned.trim();
  }
  
  /**
   * Split text into sentences
   * @param {string} text - The processed text
   * @returns {string[]} - Array of sentences
   */
  static splitSentences(text) {
    if (!text) return [];
    
    // Split on sentence endings followed by space and uppercase letter
    const sentenceRegex = /[.!?]+[\s]+(?=[A-Z])/g;
    const sentences = text.split(sentenceRegex);
    
    // Clean the sentences
    return sentences.map(s => s.trim()).filter(s => s.length > 10);
  }
  
  /**
   * Split text into paragraphs
   * @param {string} text - The processed text
   * @returns {string[]} - Array of paragraphs
   */
  static splitParagraphs(text) {
    if (!text) return [];
    
    // Split on double newlines
    const paragraphRegex = /\n\s*\n/;
    const paragraphs = text.split(paragraphRegex);
    
    // Clean the paragraphs
    return paragraphs.map(p => p.trim()).filter(p => p.length > 0);
  }
  
  /**
   * Extract keywords from text
   * @param {string} text - The processed text
   * @returns {string[]} - Array of keywords
   */
  static extractKeywords(text) {
    if (!text) return [];
    
    // Simplified keyword extraction:
    // 1. Split into words
    // 2. Convert to lowercase
    // 3. Remove stopwords
    // 4. Count frequency
    // 5. Return top N words
    
    const stopwords = [
      'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
      'which', 'this', 'that', 'these', 'those', 'then', 'just', 'so', 'than',
      'such', 'when', 'while', 'with', 'for', 'of', 'at', 'by', 'from', 'up',
      'about', 'against', 'between', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'to', 'from', 'is', 'are', 'was', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did',
      'doing', 'can', 'could', 'should', 'would', 'may', 'might', 'must'
    ];
    
    // Split into words
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    // Filter out stopwords and count frequencies
    const wordFreq = {};
    words.forEach(word => {
      if (!stopwords.includes(word) && word.length > 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    // Convert to array, sort by frequency, and return top 20
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(entry => entry[0]);
  }
}

// Export the TextProcessor class
if (typeof module !== 'undefined') {
  module.exports = TextProcessor;
}
