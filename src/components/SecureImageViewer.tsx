import { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface SecureImageViewerProps {
  imageUrl: string;
  imageName?: string;
  onClose?: () => void;
}

export default function SecureImageViewer({ imageUrl, onClose }: SecureImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = apiService.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
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
    try {
      // Fetch image as blob to prevent direct URL access
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        renderImageWithWatermark(img);
        URL.revokeObjectURL(blobUrl);
        setLoading(false);
      };
      img.onerror = () => {
        setLoading(false);
      };
      img.src = blobUrl;
    } catch (error) {
      console.error('Failed to load image:', error);
      setLoading(false);
    }
  };

  const renderImageWithWatermark = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to image size
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Add watermark
    addWatermark(ctx, canvas.width, canvas.height);
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
        </div>
      )}

      <div 
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Protected badge */}
        <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg z-10">
          🔒 PROTECTED - NO DOWNLOADS
        </div>

        {/* Canvas with image */}
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain shadow-2xl"
          style={{ 
            userSelect: 'none',
            pointerEvents: 'none'
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
