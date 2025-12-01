import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className="prose prose-lg max-w-none"
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
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-gray-300" {...props} />
          </div>
        ),
        thead: ({ ...props }) => (
          <thead className="bg-primary/10" {...props} />
        ),
        th: ({ ...props }) => (
          <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props} />
        ),
        td: ({ ...props }) => (
          <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
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
      {content}
    </ReactMarkdown>
  );
}

