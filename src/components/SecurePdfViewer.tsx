import { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface SecurePdfViewerProps {
  pdfId: string;
  pdfName: string;
  height?: string;
}

export default function SecurePdfViewer({ pdfId, pdfName, height = '800px' }: SecurePdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [courseName, setCourseName] = useState('');
  const [scale, setScale] = useState(1.0);
  const [isProcessed, setIsProcessed] = useState(false);

  // Disable all keyboard shortcuts and context menu
  useEffect(() => {
    const preventActions = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        // Block Ctrl/Cmd + P (Print)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl/Cmd + S (Save)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl/Cmd + U (View Source)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl/Cmd + Shift + I (Dev Tools)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block F12 (Dev Tools)
        if (e.key === 'F12') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block PrintScreen
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          alert('Screenshots are not allowed for this protected content.');
          return false;
        }
      }

      // Block right-click
      if (e.type === 'contextmenu') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', preventActions, true);
    document.addEventListener('contextmenu', preventActions, true);
    document.addEventListener('selectstart', preventActions, true);
    document.addEventListener('copy', preventActions, true);

    return () => {
      document.removeEventListener('keydown', preventActions, true);
      document.removeEventListener('contextmenu', preventActions, true);
      document.removeEventListener('selectstart', preventActions, true);
      document.removeEventListener('copy', preventActions, true);
    };
  }, []);

  // Fetch metadata on mount
  useEffect(() => {
    fetchMetadata();
    const user = apiService.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [pdfId]);

  // Load page when currentPage changes
  useEffect(() => {
    if (totalPages > 0 && isProcessed) {
      loadPage(currentPage);
    }
  }, [currentPage, totalPages, isProcessed, scale]);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPdfMetadata(pdfId);
      
      if (response.success) {
        setTotalPages(response.data.totalPages);
        setCourseName(response.data.courseName);
        setIsProcessed(response.data.isProcessed);

        if (!response.data.isProcessed) {
          setError('This PDF is being processed. Please refresh in a few moments.');
        }
      } else {
        setError('Failed to load PDF metadata');
      }
    } catch (error: any) {
      console.error('Failed to fetch PDF metadata:', error);
      setError(error.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (pageNumber: number) => {
    if (!canvasRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch page image via authenticated API
      const imageBlob = await apiService.getPdfPage(pdfId, pageNumber);
      const imageUrl = URL.createObjectURL(imageBlob);

      // Load image
      const img = new Image();
      img.onload = () => {
        renderPageWithWatermark(img);
        URL.revokeObjectURL(imageUrl); // Clean up
        setLoading(false);
      };
      img.onerror = () => {
        setError('Failed to load page image');
        setLoading(false);
      };
      img.src = imageUrl;

    } catch (error: any) {
      console.error('Failed to load page:', error);
      setError(error.message || 'Failed to load page');
      setLoading(false);
    }
  };

  const renderPageWithWatermark = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scaled dimensions
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    // Set canvas size
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Clear canvas
    ctx.clearRect(0, 0, scaledWidth, scaledHeight);

    // Draw PDF page image (scaled)
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    // Add watermark overlay
    addWatermark(ctx, scaledWidth, scaledHeight);
  };

  const addWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Save context state
    ctx.save();

    // Draw diagonal watermarks (subtle)
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${18 * scale}px Arial`;
    ctx.textAlign = 'center';

    // Rotate canvas for diagonal watermarks
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-45 * Math.PI / 180);

    // Add multiple watermark instances in grid
    const watermarkText = userEmail || 'Protected Content';
    const date = new Date().toLocaleDateString();
    
    for (let y = -height; y < height * 1.5; y += 200 * scale) {
      for (let x = -width; x < width * 1.5; x += 350 * scale) {
        ctx.fillText(watermarkText, x, y);
        ctx.font = `${12 * scale}px Arial`;
        ctx.fillText(date, x, y + 25 * scale);
        ctx.font = `bold ${18 * scale}px Arial`;
      }
    }

    // Restore context
    ctx.restore();

    // Add bottom license bar (more visible)
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, height - 45, Math.min(width - 20, 500), 35);
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1a1f71';
    ctx.font = `bold ${11 * scale}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`🔒 Licensed to: ${userEmail}`, 15, height - 28);
    ctx.font = `${10 * scale}px Arial`;
    ctx.fillText(`${courseName} | ${date} | Page ${currentPage} of ${totalPages}`, 15, height - 15);

    // Add "No Screenshots" warning at top
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(width - 210, 10, 200, 28);
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${11 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('🚫 NO SCREENSHOTS', width - 110, 28);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(Math.min(scale + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(Math.max(scale - 0.2, 0.5));
  };

  if (error) {
    return (
      <div className="bg-gray-100 flex items-center justify-center p-8" style={{ height }}>
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ {error}</div>
          <button
            onClick={fetchMetadata}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="bg-gray-900 select-none relative"
      style={{ height, userSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      {/* Canvas container with scrolling */}
      <div className="flex items-start justify-center h-full overflow-auto p-8">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4 mx-auto"></div>
              <p className="text-white text-sm">Loading page {currentPage}...</p>
            </div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="shadow-2xl"
          style={{ 
            userSelect: 'none',
            pointerEvents: 'none',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>

      {/* Bottom Control Bar */}
      {isProcessed && totalPages > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl p-3 flex items-center gap-4 z-20">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 pr-4 border-r border-gray-300">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <MagnifyingGlassMinusIcon className="h-5 w-5" />
            </button>
            <span className="text-xs font-semibold w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <MagnifyingGlassPlusIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Page Navigation */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1 || loading}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
              className="w-12 text-center border border-gray-300 rounded px-1 py-1 text-sm"
            />
            <span className="text-sm font-semibold text-gray-600">
              / {totalPages}
            </span>
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || loading}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Protected Content Badge */}
      <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg z-20">
        🔒 PROTECTED - NO DOWNLOADS
      </div>

      {/* Filename Display */}
      <div className="absolute top-4 left-4 bg-white/90 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg z-20 max-w-md truncate">
        📄 {pdfName}
      </div>
    </div>
  );
}
