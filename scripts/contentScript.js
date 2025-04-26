// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "extractText") {
    const extractedText = extractTextFromPage();
    sendResponse({text: extractedText});
  }
  return true;
});

// Function to extract text from the current webpage
function extractTextFromPage() {
  // Get the main content area, prioritize article content or common content areas
  const contentSelectors = [
    'article', 
    'main', 
    '.content', 
    '#content',
    '.article',
    '.post',
    '.entry-content'
  ];
  
  let contentElement = null;
  
  // Try to find a relevant content container
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      contentElement = element;
      break;
    }
  }
  
  // If no specific content area found, use the body
  if (!contentElement) {
    contentElement = document.body;
  }
  
  // Extract text, prioritizing paragraph content
  const paragraphs = contentElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
  
  if (paragraphs.length > 0) {
    return Array.from(paragraphs)
      .map(p => p.textContent.trim())
      .filter(text => text.length > 0)
      .join('\n\n');
  }
  
  // If no paragraphs found, get all text content, excluding scripts and styles
  const textNodes = [];
  const walker = document.createTreeWalker(
    contentElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        if (!/^(script|style|noscript|iframe)$/i.test(node.parentNode.nodeName) && node.textContent.trim()) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  while(walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (text.length > 20) { // Only add nodes with substantial text
      textNodes.push(text);
    }
  }
  
  return textNodes.join('\n\n');
}
