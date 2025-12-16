import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { ResultDisplay } from './components/ResultDisplay';
import { ControlPanel } from './components/ControlPanel';
import { ImageCropper } from './components/ImageCropper';
import { generateFabricOverlay } from './services/geminiService';
import { AppStatus, FileWithPreview, GenerationSettings } from './types';
import { Sparkles, Shirt, Layers, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [modelImage, setModelImage] = useState<FileWithPreview | null>(null);
  const [patternImage, setPatternImage] = useState<FileWithPreview | null>(null);
  const [originalPatternFile, setOriginalPatternFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    scale: 'original',
    fabricType: 'original',
    targetArea: 'whole outfit',
    customPrompt: ''
  });

  const handleModelSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setModelImage({ file, previewUrl });
    if (status === AppStatus.SUCCESS) setStatus(AppStatus.IDLE);
  };

  const handlePatternSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setPatternImage({ file, previewUrl });
    setOriginalPatternFile(file); // Store original in case they want to recrop
    // Automatically trigger cropper for pattern to encourage selection
    setIsCropping(true); 
    if (status === AppStatus.SUCCESS) setStatus(AppStatus.IDLE);
  };

  const handleCroppedPattern = (croppedFile: File) => {
    // Revoke old preview if it exists
    if (patternImage) {
        URL.revokeObjectURL(patternImage.previewUrl);
    }
    const previewUrl = URL.createObjectURL(croppedFile);
    setPatternImage({ file: croppedFile, previewUrl });
    setIsCropping(false);
  };

  const clearModel = () => {
    if (modelImage) URL.revokeObjectURL(modelImage.previewUrl);
    setModelImage(null);
    setStatus(AppStatus.IDLE);
    setResultImage(null);
  };

  const clearPattern = () => {
    if (patternImage) URL.revokeObjectURL(patternImage.previewUrl);
    setPatternImage(null);
    setOriginalPatternFile(null);
    setStatus(AppStatus.IDLE);
    setResultImage(null);
  };

  const handleGenerate = async () => {
    if (!modelImage || !patternImage) return;

    setStatus(AppStatus.GENERATING);
    setErrorMsg(null);
    setResultImage(null);

    try {
      const result = await generateFabricOverlay(modelImage.file, patternImage.file, settings);
      
      if (result.imageUrl) {
        setResultImage(result.imageUrl);
        setStatus(AppStatus.SUCCESS);
      } else {
        throw new Error("The model generated text but no image. Please try again with different inputs.");
      }
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg(err.message || "Something went wrong. Please check your API key and try again.");
    }
  };

  const isReady = modelImage !== null && patternImage !== null;

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Navbar */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              FabricFusion AI
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs font-medium text-slate-400">
                PRO Studio Mode
             </div>
             <div className="text-sm text-slate-400 hidden sm:block">
                Powered by Nano Banana
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column: Workflow */}
          <div className="lg:col-span-5 space-y-8">
            
            <div className="space-y-6">
              {/* Step 1: Inputs */}
              <div className="space-y-6">
                 <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Layers size={100} />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs text-white">1</span>
                       Reference Material
                    </h2>
                    <div className="space-y-4">
                      <UploadZone 
                        label="Model Photo" 
                        subLabel="Base Stencil"
                        onFileSelect={handleModelSelect}
                        onClear={clearModel}
                        selectedImage={modelImage}
                        disabled={status === AppStatus.GENERATING}
                      />
                      <div className="relative">
                         <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                         </div>
                         <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-800 text-slate-500">+</span>
                         </div>
                      </div>
                      <UploadZone 
                        label="Fabric Pattern" 
                        subLabel="Material Design (Upload swatches)"
                        onFileSelect={handlePatternSelect}
                        onClear={clearPattern}
                        selectedImage={patternImage}
                        disabled={status === AppStatus.GENERATING}
                        onCrop={() => {
                            if (originalPatternFile) setIsCropping(true);
                            else if (patternImage) setIsCropping(true); // Fallback to current if original lost
                        }}
                      />
                    </div>
                 </div>
              </div>

              {/* Step 2: Controls */}
              <ControlPanel 
                settings={settings} 
                onUpdate={setSettings} 
                disabled={status === AppStatus.GENERATING} 
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={!isReady || status === AppStatus.GENERATING}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all transform duration-300
                ${isReady && status !== AppStatus.GENERATING
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] hover:shadow-indigo-500/40 text-white cursor-pointer ring-1 ring-white/10'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }
              `}
            >
              {status === AppStatus.GENERATING ? (
                <>Generating Preview...</>
              ) : (
                <>
                  <Sparkles className={isReady ? "animate-pulse" : ""} />
                  Render Fabric Simulation
                  <ArrowRight size={20} className="opacity-60" />
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
             <div className="sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 pl-2">
                      <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-white">Simulation Result</h2>
                   </div>
                   {status === AppStatus.SUCCESS && (
                      <span className="text-xs font-mono text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                         RENDER COMPLETE
                      </span>
                   )}
                </div>
                
                <ResultDisplay 
                  isLoading={status === AppStatus.GENERATING}
                  resultImage={resultImage}
                  error={errorMsg}
                  fabricOverlay={patternImage?.previewUrl}
                />

                {/* Info Cards */}
                {!resultImage && status !== AppStatus.GENERATING && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                      <h4 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                        <Layers size={16} /> Manufacturer Tip
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Upload a photo of multiple fabric swatches and use the <strong>Select / Crop</strong> tool to pick the exact one you want to test.
                      </p>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                      <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <Shirt size={16} /> Material Physics
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Selecting specific fabrics like <strong>Silk</strong> or <strong>Denim</strong> will adjust how light reflects off the folds in the generated image.
                      </p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Modal Cropper */}
        {isCropping && (originalPatternFile || patternImage) && (
            <ImageCropper 
                imageFile={originalPatternFile || patternImage!.file}
                onConfirm={handleCroppedPattern}
                onCancel={() => setIsCropping(false)}
            />
        )}

      </main>
    </div>
  );
};

export default App;
