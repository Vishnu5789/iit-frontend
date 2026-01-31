import { useEffect, useRef, useState } from 'react';
import { XMarkIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface SecureImageViewerProps {
  imageUrl: string;
  imageName?: string;
  onClose?: () => void;
}

export default function SecureImageViewer({ imageUrl, onClose }: SecureImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [zoom, setZoom] = useState(1);
  const [imageData, setImageData] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const user = apiService.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
    console.log('Loading image from URL:', imageUrl);
    loadImage();
  }, [imageUrl]);

  // Prevent all interactions
  useEffect(() => {
    const preventActions = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    document.addEventListener('contextmenu', preventActions, true);
    document.addEventListener('dragstart', preventActions, true);
    document.addEventListener('selectstart', preventActions, true);
    document.addEventListener('copy', preventActions, true);

    return () => {
      document.removeEventListener('contextmenu', preventActions, true);
      document.removeEventListener('dragstart', preventActions, true);
      document.removeEventListener('selectstart', preventActions, true);
      document.removeEventListener('copy', preventActions, true);
    };
  }, []);

  const loadImage = async () => {
    setLoading(true);
    setError(false);
    try {
      const img = new Image();
      
      img.onload = () => {
        setImageData(img);
        renderImageWithWatermark(img, zoom, position);
        setLoading(false);
      };
      
      img.onerror = (e) => {
        console.error('Image load error:', e);
        setError(true);
        setLoading(false);
      };
      
      // Load image directly (CORS should be handled by S3 config)
      img.src = imageUrl;
    } catch (error) {
      console.error('Failed to load image:', error);
      setError(true);
      setLoading(false);
    }
  };

  // Re-render when zoom or position changes
  useEffect(() => {
    if (imageData && !loading && !error) {
      renderImageWithWatermark(imageData, zoom, position);
    }
  }, [zoom, position, imageData]);

  const renderImageWithWatermark = (img: HTMLImageElement, currentZoom: number, currentPosition: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scaled dimensions to fit viewport
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    
    let baseWidth = img.width;
    let baseHeight = img.height;
    
    // Scale down if image is too large
    if (baseWidth > maxWidth || baseHeight > maxHeight) {
      const widthRatio = maxWidth / baseWidth;
      const heightRatio = maxHeight / baseHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      
      baseWidth = baseWidth * ratio;
      baseHeight = baseHeight * ratio;
    }

    // Set canvas size to scaled dimensions
    canvas.width = baseWidth;
    canvas.height = baseHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(currentZoom, currentZoom);
    ctx.translate(-canvas.width / 2 + currentPosition.x, -canvas.height / 2 + currentPosition.y);

    // Draw image
    ctx.drawImage(img, 0, 0, baseWidth, baseHeight);

    ctx.restore();

    // Add watermark
    addWatermark(ctx, baseWidth, baseHeight);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
    // Reset position when zooming out to prevent being stuck off-screen
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const addWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Save context
    ctx.save();

    // Diagonal watermarks (subtle)
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';

    // Rotate for diagonal
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-45 * Math.PI / 180);

    // Add watermark grid
    const watermarkText = userEmail || 'Protected Content';
    const date = new Date().toLocaleDateString();
    
    for (let y = -height; y < height * 1.5; y += 250) {
      for (let x = -width; x < width * 1.5; x += 400) {
        ctx.fillText(watermarkText, x, y);
        ctx.font = '16px Arial';
        ctx.fillText(date, x, y + 35);
        ctx.font = 'bold 24px Arial';
      }
    }

    ctx.restore();

    // Bottom license bar
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, height - 45, Math.min(width - 20, 500), 35);
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1a1f71';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🔒 Licensed to: ${userEmail}`, 15, height - 25);
    ctx.font = '11px Arial';
    ctx.fillText(`${date} - Protected Content`, 15, height - 10);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading image...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-xl mb-2">❌ Failed to load image</p>
            <p className="text-sm text-white/70">Please try again or contact support</p>
          </div>
        </div>
      )}

      <div 
        ref={containerRef}
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Zoom controls */}
        <div className="absolute top-4 right-20 flex gap-2 z-10">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In (Scroll Up)"
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-full transition-all text-sm font-semibold"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out (Scroll Down)"
          >
            <MagnifyingGlassMinusIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Protected badge */}
        <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg z-10">
          🔒 PROTECTED - NO DOWNLOADS
        </div>

        {/* Zoom hint */}
        {zoom === 1 && !loading && !error && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-4 py-2 rounded-lg text-xs shadow-lg z-10">
            💡 Use scroll wheel to zoom • Click and drag to pan when zoomed
          </div>
        )}

        {/* Canvas with image */}
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain shadow-2xl bg-white rounded-lg"
          style={{ 
            userSelect: 'none',
            pointerEvents: 'none',
            display: loading || error ? 'none' : 'block'
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
