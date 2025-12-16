import React, { useCallback, useState } from 'react';
import { Upload, X, Crop, Edit3 } from 'lucide-react';
import { FileWithPreview } from '../types';

interface UploadZoneProps {
  label: string;
  subLabel: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  selectedImage: FileWithPreview | null;
  disabled?: boolean;
  onCrop?: () => void; // Optional prop to trigger crop
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  label,
  subLabel,
  onFileSelect,
  onClear,
  selectedImage,
  disabled = false,
  onCrop
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, disabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full h-64 md:h-80 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-lg transition-all hover:border-slate-500">
        <img 
          src={selectedImage.previewUrl} 
          alt={label} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
           <div className="flex gap-2">
              <button
                onClick={onClear}
                disabled={disabled}
                className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full transform transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                title="Remove Image"
              >
                <X size={20} />
              </button>
              
              {onCrop && (
                <button
                  onClick={(e) => {
                      e.stopPropagation();
                      onCrop();
                  }}
                  disabled={disabled}
                  className="p-3 bg-indigo-500/80 hover:bg-indigo-600 text-white rounded-full transform transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  title="Select / Crop Area"
                >
                  <Crop size={20} />
                </button>
              )}
           </div>
          <span className="text-white font-medium text-sm">Edit or Remove</span>
        </div>
        <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm border border-white/10 flex items-center gap-2">
          {label}
        </div>
        {onCrop && (
            <div className="absolute bottom-3 right-3 bg-indigo-600/90 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none opacity-80">
                Click to Select Pattern
            </div>
        )}
      </div>
    );
  }

  return (
    <label 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-64 md:h-80 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
          : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input 
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleInputChange}
        disabled={disabled}
      />
      <div className="p-4 bg-slate-700/50 rounded-full mb-4 group-hover:bg-slate-700 transition-colors">
        <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
      </div>
      <p className="text-lg font-semibold text-slate-200 mb-1">{label}</p>
      <p className="text-sm text-slate-400 text-center max-w-[80%]">{subLabel}</p>
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/20 backdrop-blur-[2px] rounded-xl border-2 border-indigo-500">
          <p className="text-indigo-300 font-bold text-lg">Drop it here!</p>
        </div>
      )}
    </label>
  );
};
