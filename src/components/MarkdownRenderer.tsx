import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Process content to ensure tables are properly formatted
  // Tables need blank lines before and after them to be recognized by markdown parsers
  let processedContent = content;
  
  // Split content into lines for better processing
  const lines = processedContent.split('\n');
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    const prevIsTableRow = prevLine.trim().startsWith('|') && prevLine.trim().endsWith('|');
    const nextIsTableRow = nextLine.trim().startsWith('|') && nextLine.trim().endsWith('|');
    
    // If this is a table row
    if (isTableRow) {
      // Add blank line before table if previous line is not a table row and not empty
      if (!prevIsTableRow && prevLine.trim() !== '' && processedLines.length > 0 && processedLines[processedLines.length - 1].trim() !== '') {
        processedLines.push('');
      }
      processedLines.push(line);
      // Add blank line after table if next line is not a table row and not empty
      if (!nextIsTableRow && nextLine.trim() !== '' && i < lines.length - 1) {
        processedLines.push('');
      }
    } else {
      processedLines.push(line);
    }
  }
  
  processedContent = processedLines.join('\n');
  
  return (
    <div className="markdown-content">
    <ReactMarkdown
      className="prose prose-lg max-w-none"
        remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ ...props }) => (
          <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-6 leading-tight" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="text-3xl font-bold text-primary mt-10 mb-5 leading-tight border-b-2 border-primary/20 pb-2" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4 leading-tight" {...props} />
        ),
        h4: ({ ...props }) => (
          <h4 className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props} />
        ),
        h5: ({ ...props }) => (
          <h5 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />
        ),
        h6: ({ ...props }) => (
          <h6 className="text-base font-semibold text-gray-800 mt-4 mb-2" {...props} />
        ),
        
        // Paragraphs
        p: ({ ...props }) => (
          <p className="text-gray-700 leading-relaxed mb-5 text-base" {...props} />
        ),
        
        // Lists
        ul: ({ ...props }) => (
          <ul className="list-disc list-outside ml-6 mb-5 space-y-2" {...props} />
        ),
        ol: ({ ...props }) => (
          <ol className="list-decimal list-outside ml-6 mb-5 space-y-2" {...props} />
        ),
        li: ({ ...props }) => (
          <li className="text-gray-700 leading-relaxed pl-2" {...props} />
        ),
        
        // Emphasis
        strong: ({ ...props }) => (
          <strong className="font-bold text-gray-900" {...props} />
        ),
        em: ({ ...props }) => (
          <em className="italic text-gray-800" {...props} />
        ),
        
        // Links
        a: ({ ...props }) => (
          <a 
            className="text-primary font-medium underline hover:text-primary/80 transition-colors" 
            target="_blank" 
            rel="noopener noreferrer"
            {...props} 
          />
        ),
        
        // Blockquotes
        blockquote: ({ ...props }) => (
          <blockquote 
            className="border-l-4 border-primary bg-primary/5 pl-6 pr-4 py-4 my-6 italic text-gray-700"
            {...props} 
          />
        ),
        
        // Code
        code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code 
                className="bg-gray-100 text-primary px-2 py-1 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code 
              className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4"
              {...props}
            >
              {children}
            </code>
          );
        },
        
        // Horizontal Rule
        hr: ({ ...props }) => (
          <hr className="my-10 border-t-2 border-gray-200" {...props} />
        ),
        
        // Tables
        table: ({ ...props }) => (
          <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full border-collapse bg-white w-full" {...props} />
          </div>
        ),
        thead: ({ ...props }) => (
          <thead className="bg-primary/10" {...props} />
        ),
        tbody: ({ ...props }) => (
          <tbody className="bg-white" {...props} />
        ),
        tr: ({ ...props }) => (
          <tr className="hover:bg-gray-50 transition-colors border-b border-gray-200" {...props} />
        ),
        th: ({ ...props }) => (
          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 bg-primary/5" style={{ whiteSpace: 'normal', wordWrap: 'break-word' }} {...props} />
        ),
        td: ({ ...props }) => (
          <td className="border border-gray-300 px-4 py-3 text-gray-700 align-top" style={{ whiteSpace: 'normal', wordWrap: 'break-word' }} {...props} />
        ),
        
        // Images
        img: ({ ...props }) => (
          <img 
            className="rounded-lg shadow-lg my-6 w-full object-cover" 
            loading="lazy"
            {...props} 
          />
        ),
      }}
    >
        {processedContent}
    </ReactMarkdown>
    </div>
  );
}

