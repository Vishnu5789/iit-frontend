/**
 * Content Cleaner Utility
 * Cleans up malformed content that has visible HTML tags or broken table formatting
 */

export const cleanContent = (content: string): string => {
  if (!content) return '';

  let cleaned = content;

  // Replace HTML entities with proper characters FIRST
  cleaned = cleaned.replace(/&nbsp;/gi, ' ');
  cleaned = cleaned.replace(/&amp;/gi, '&');
  cleaned = cleaned.replace(/&lt;/gi, '<');
  cleaned = cleaned.replace(/&gt;/gi, '>');
  cleaned = cleaned.replace(/&quot;/gi, '"');
  cleaned = cleaned.replace(/&#39;/gi, "'");

  // Remove visible HTML tags
  cleaned = cleaned.replace(/<\/div>\s*<div[^>]*>/gi, '\n');
  cleaned = cleaned.replace(/<\/?div[^>]*>/gi, '\n');
  cleaned = cleaned.replace(/<\/?span[^>]*>/gi, '');
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  
  // Fix tables that are on one line or have rows concatenated
  if (cleaned.includes('|')) {
    // Strategy: Look for patterns where table rows are joined
    // Pattern 1: | cell | cell | | cell | cell | (space before second |)
    // Pattern 2: | cell | cell || cell | cell | (no space)
    // Pattern 3: | cell | cell |  | cell | cell | (two spaces)
    
    // Split on patterns that indicate row breaks
    // Match: pipe, optional spaces, pipe, optional spaces (but not part of cell content)
    cleaned = cleaned.replace(/\|\s*\|\s*\|/g, '|\n|');  // ||| or | | |
    cleaned = cleaned.replace(/\|\s{2,}\|/g, '|\n|');     // |  | (multiple spaces)
    
    // Now process line by line
    const lines = cleaned.split('\n');
    const tableLines: string[] = [];
    let inTable = false;
    
    for (let line of lines) {
      line = line.trim();
      if (!line) {
        if (inTable) {
          inTable = false;
          tableLines.push(''); // Blank line after table
        }
        continue;
      }
      
      if (line.includes('|')) {
        // This is a table line
        if (!inTable) {
          inTable = true;
          tableLines.push(''); // Blank line before table
        }
        
        // Ensure proper pipe formatting
        if (!line.startsWith('|')) line = '| ' + line;
        if (!line.endsWith('|')) line = line + ' |';
        
        // Check if this is a separator row (contains mostly dashes)
        if (line.match(/^[\|\s\-]+$/)) {
          // Count number of columns from pipes
          const pipes = (line.match(/\|/g) || []).length;
          const cols = pipes - 1;
          if (cols > 0) {
            line = '| ' + Array(cols).fill('---').join(' | ') + ' |';
          }
        }
        
        tableLines.push(line);
      } else {
        if (inTable) {
          inTable = false;
          tableLines.push(''); // Blank line after table
        }
        tableLines.push(line);
      }
    }
    
    cleaned = tableLines.join('\n');
  }
  
  // Remove multiple consecutive spaces
  cleaned = cleaned.replace(/  +/g, ' ');
  
  // Remove multiple consecutive newlines (keep max 2)
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n');
  
  // Trim
  cleaned = cleaned.trim();

  return cleaned;
};

/**
 * Detect if content is valid HTML (from rich text editor)
 */
export const isValidHTML = (content: string): boolean => {
  if (!content) return false;
  
  const trimmed = content.trim();
  const startsWithHTML = trimmed.startsWith('<');
  const hasVisibleTags = /&lt;|&gt;|<div>/.test(trimmed.substring(0, 100));
  
  return startsWithHTML && !hasVisibleTags;
};

/**
 * Smart content renderer - auto-detects format and cleans if needed
 */
export const prepareContentForRendering = (content: string): { 
  content: string; 
  isHTML: boolean; 
  needsCleaning: boolean 
} => {
  if (!content) return { content: '', isHTML: false, needsCleaning: false };

  // Check if content has visible HTML tags (malformed)
  const hasVisibleHTMLTags = /<div>|<\/div>|&nbsp;|&lt;|&gt;/.test(content.substring(0, 200));
  
  if (hasVisibleHTMLTags) {
    // Content needs cleaning
    const cleaned = cleanContent(content);
    return {
      content: cleaned,
      isHTML: false,
      needsCleaning: true
    };
  }

  // Check if it's valid HTML
  const validHTML = isValidHTML(content);
  
  return {
    content: content,
    isHTML: validHTML,
    needsCleaning: false
  };
};
