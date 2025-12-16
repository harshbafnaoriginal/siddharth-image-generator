import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Crop as CropIcon } from 'lucide-react';

interface ImageCropperProps {
  imageFile: File;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageFile, onConfirm, onCancel }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [selection, setSelection] = useState<{x: number, y: number, w: number, h: number} | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setSelection({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPos || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const w = Math.abs(currentX - startPos.x);
    const h = Math.abs(currentY - startPos.y);
    const left = Math.min(currentX, startPos.x);
    const top = Math.min(currentY, startPos.y);
    
    setSelection({ x: left, y: top, w, h });
  };

  const handleMouseUp = () => {
    setStartPos(null);
  };

  const handleCrop = () => {
    if (!imgRef.current || !selection) {
       onConfirm(imageFile);
       return;
    }

    // Safety check for very small selections (clicks vs drags)
    if (selection.w < 10 || selection.h < 10) {
        onConfirm(imageFile);
        return;
    }

    const canvas = document.createElement('canvas');
    // Ensure we have loaded the image and dimensions are valid
    if (imgRef.current.width === 0 || imgRef.current.height === 0) {
        console.error("Image dimensions zero");
        onConfirm(imageFile);
        return;
    }

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    // Calculate dimensions with strict integer flooring
    const finalWidth = Math.floor(selection.w * scaleX);
    const finalHeight = Math.floor(selection.h * scaleY);

    // Enforce minimum size (50x50) to prevent 'output dimensions must be positive' or kernel errors in backend
    if (finalWidth < 50 || finalHeight < 50) {
        alert("Selection too small. Please select a larger area.");
        return;
    }

    canvas.width = finalWidth;
    canvas.height = finalHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        imgRef.current,
        selection.x * scaleX,
        selection.y * scaleY,
        selection.w * scaleX,
        selection.h * scaleY,
        0,
        0,
        finalWidth,
        finalHeight
      );

      canvas.toBlob((blob) => {
        if (blob) {
          // Preserve mime type of original or default to png
          const type = imageFile.type || "image/png"; 
          const ext = type.split('/')[1] || 'png';
          const newFile = new File([blob], `cropped-fabric.${ext}`, { type });
          onConfirm(newFile);
        } else {
            console.error("Canvas toBlob failed");
            onConfirm(imageFile);
        }
      }, imageFile.type || 'image/png', 0.95);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 text-white">
        <div className="flex items-center gap-3">
            <CropIcon className="text-indigo-400" />
            <div>
                <h3 className="text-xl font-bold">Select Fabric Swatch</h3>
                <p className="text-xs text-slate-400">Click and drag to choose the specific pattern area</p>
            </div>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={onCancel} 
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleCrop} 
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
            >
                <Check size={18}/> 
                Confirm Selection
            </button>
        </div>
      </div>
      
      <div 
        className="relative overflow-hidden border-2 border-slate-700 bg-slate-900 rounded-xl shadow-2xl cursor-crosshair max-h-[80vh] flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
            ref={imgRef}
            src={imageUrl} 
            alt="Crop target" 
            className="max-h-[75vh] max-w-full object-contain select-none"
            draggable={false}
        />
        {selection && selection.w > 0 && (
            <>
                {/* Darken area outside selection */}
                <div 
                    className="absolute inset-0 bg-black/60 pointer-events-none"
                    style={{
                        clipPath: `polygon(
                            0% 0%, 
                            0% 100%, 
                            ${selection.x}px 100%, 
                            ${selection.x}px ${selection.y}px, 
                            ${selection.x + selection.w}px ${selection.y}px, 
                            ${selection.x + selection.w}px ${selection.y + selection.h}px, 
                            ${selection.x}px ${selection.y + selection.h}px, 
                            ${selection.x}px 100%, 
                            100% 100%, 
                            100% 0%
                        )`
                    }}
                />
                {/* Selection Border */}
                <div 
                    className="absolute border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] pointer-events-none"
                    style={{
                        left: selection.x,
                        top: selection.y,
                        width: selection.w,
                        height: selection.h,
                    }}
                >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white -mb-1 -mr-1"></div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};