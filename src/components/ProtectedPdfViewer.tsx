import { useEffect, useState } from 'react';
import apiService from '../services/api';

interface ProtectedPdfViewerProps {
  pdfUrl: string;
  pdfName: string;
  height?: string;
}

export default function ProtectedPdfViewer({ pdfUrl, pdfName, height = '600px' }: ProtectedPdfViewerProps) {
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const user = apiService.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, []);

  // Generate watermark pattern
  const generateWatermarkPattern = () => {
    const watermarks = [];
    const rows = 6;
    const cols = 3;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        watermarks.push({
          key: `${i}-${j}`,
          top: `${(i * 100 / rows) + 10}%`,
          left: `${(j * 100 / cols) + 10}%`,
        });
      }
    }
    return watermarks;
  };

  const watermarks = generateWatermarkPattern();

  return (
    <div 
      className="bg-gray-100 select-none relative overflow-hidden" 
      style={{ height, userSelect: 'none' }}
    >
      {/* PDF iframe - fully interactive for scrolling */}
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
        className="w-full h-full border-0"
        title={pdfName}
        style={{ userSelect: 'none' }}
      />

      {/* Watermark overlay - Multiple instances for full coverage */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {watermarks.map((pos) => (
          <div
            key={pos.key}
            className="absolute transform -rotate-45"
            style={{
              top: pos.top,
              left: pos.left,
              opacity: 0.08,
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {userEmail || 'Protected Content'}
            <br />
            <span style={{ fontSize: '10px' }}>
              {new Date().toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      {/* Protected content badge */}
      <div className="absolute top-2 right-2 bg-red-500/80 text-white px-3 py-1 rounded text-xs font-semibold pointer-events-none z-30 shadow-lg">
        🔒 Protected Content
      </div>

      {/* Bottom watermark */}
      <div className="absolute bottom-2 left-2 text-gray-400 text-xs pointer-events-none z-30 bg-white/80 px-2 py-1 rounded">
        {userEmail && `Licensed to: ${userEmail}`}
      </div>
    </div>
  );
}
