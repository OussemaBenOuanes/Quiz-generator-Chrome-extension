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
  // Try to get the main content area, prioritize article content or common content areas
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
    if (element && element.innerText && element.innerText.trim().length > 100) {
      contentElement = element;
      break;
    }
  }

  // If no specific content area found, use the body
  if (!contentElement) {
    contentElement = document.body;
  }

  // Extract visible text only (skip scripts, styles, hidden, nav, footer, header, aside)
  function getVisibleText(node) {
    if (
      node.nodeType === Node.TEXT_NODE &&
      node.parentNode &&
      node.textContent.trim() &&
      window.getComputedStyle(node.parentNode).display !== "none" &&
      window.getComputedStyle(node.parentNode).visibility !== "hidden"
    ) {
      return node.textContent.trim();
    }
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'NAV', 'FOOTER', 'HEADER', 'ASIDE'].includes(node.nodeName) &&
      window.getComputedStyle(node).display !== "none" &&
      window.getComputedStyle(node).visibility !== "hidden"
    ) {
      let text = '';
      for (let child of node.childNodes) {
        text += getVisibleText(child) + ' ';
      }
      return text;
    }
    return '';
  }

  let text = getVisibleText(contentElement);

  // Clean up excessive whitespace and blank lines
  text = text.replace(/\s{2,}/g, ' ').replace(/(\n\s*){2,}/g, '\n\n').trim();

  // If still too short, fallback to document.body.innerText
  if (text.length < 100) {
    text = document.body.innerText.replace(/\s{2,}/g, ' ').replace(/(\n\s*){2,}/g, '\n\n').trim();
  }

  return text;
}
