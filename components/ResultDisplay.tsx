import React from 'react';
import { Download, Sparkles, AlertCircle } from 'lucide-react';

interface ResultDisplayProps {
  isLoading: boolean;
  resultImage: string | null;
  error: string | null;
  fabricOverlay?: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, resultImage, error, fabricOverlay }) => {
  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load main image
      const mainImg = new Image();
      mainImg.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        mainImg.onload = resolve;
        mainImg.onerror = reject;
        mainImg.src = resultImage;
      });

      canvas.width = mainImg.naturalWidth;
      canvas.height = mainImg.naturalHeight;

      // Draw main image
      ctx.drawImage(mainImg, 0, 0);

      // Draw Fabric Overlay if exists
      if (fabricOverlay) {
        const swatchImg = new Image();
        swatchImg.crossOrigin = "anonymous";
        await new Promise((resolve) => {
            swatchImg.onload = resolve;
            swatchImg.onerror = resolve; // Continue even if fails (just don't draw it)
            swatchImg.src = fabricOverlay;
        });

        // Determine overlay size (approx 15-20% of width)
        const overlaySize = Math.max(80, canvas.width * 0.18);
        const padding = Math.max(20, canvas.width * 0.04);
        
        // Position: Bottom Right
        const x = canvas.width - overlaySize - padding;
        const y = canvas.height - overlaySize - padding;
        const cardPadding = overlaySize * 0.1;

        // Draw background card
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)"; // slate-900
        
        // Draw container rect
        ctx.fillRect(
            x - cardPadding, 
            y - cardPadding - (overlaySize * 0.25), // Extra space top for text 
            overlaySize + (cardPadding * 2), 
            overlaySize + (cardPadding * 2) + (overlaySize * 0.25)
        );
        
        // Draw Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        const fontSize = Math.max(10, overlaySize * 0.15);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            "FABRIC USED", 
            x + (overlaySize / 2), 
            y - (overlaySize * 0.12)
        );

        // Draw Swatch Image
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;
        // Clip to rounded rect if possible, but rect is fine
        ctx.strokeRect(x, y, overlaySize, overlaySize);
        ctx.drawImage(swatchImg, x, y, overlaySize, overlaySize);
        
        ctx.restore();
      }

      // Trigger download
      const link = document.createElement('a');
      link.download = 'fabric-fusion-result.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (e) {
      console.error("Download compositing failed", e);
      // Fallback to simple download
      const link = document.createElement('a');
      link.download = 'fabric-fusion-result.png';
      link.href = resultImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (error) {
    return (
      <div className="w-full h-96 md:h-[600px] rounded-2xl border-2 border-red-500/30 bg-red-900/10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-2xl font-bold text-red-200 mb-2">Generation Failed</h3>
        <p className="text-red-300 max-w-md">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 md:h-[600px] rounded-2xl border border-slate-700 bg-slate-800/30 relative overflow-hidden flex flex-col items-center justify-center p-8">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-4 border-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Sparkles className="w-8 h-8 text-indigo-300 animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Weaving Magic...</h3>
          <p className="text-slate-400 text-center max-w-md">
            Analyzing garment structure and applying fabric physics. This usually takes about 10-15 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (resultImage) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-500 relative">
        <div className="relative group">
          <img 
            src={resultImage} 
            alt="Generated Fashion" 
            className="w-full h-auto max-h-[700px] object-contain bg-black/20"
          />
          
          {/* Fabric Swatch Overlay (Visual Preview) */}
          {fabricOverlay && (
            <div className="absolute bottom-6 right-6 z-20 group-hover:opacity-100 transition-opacity">
               <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-xl flex flex-col items-center">
                   <p className="text-[10px] text-white/70 mb-1 font-medium text-center uppercase tracking-wider">Fabric Used</p>
                   <img 
                       src={fabricOverlay} 
                       alt="Fabric Swatch" 
                       className="w-16 h-16 md:w-20 md:h-20 object-cover rounded border border-white/10"
                   />
               </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transform transition-all hover:-translate-y-1 cursor-pointer"
            >
              <Download size={20} />
              Download Image
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 md:h-[600px] rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/20 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Sparkles className="w-10 h-10 text-slate-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-400 mb-2">Ready to Create</h3>
      <p className="text-slate-500 max-w-sm">
        Upload your model and pattern images above, then hit generate to see the magic happen.
      </p>
    </div>
  );
};
