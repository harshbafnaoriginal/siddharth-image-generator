import React from 'react';
import { Settings2, Maximize, Shirt, Scan, Palette, ScrollText } from 'lucide-react';
import { GenerationSettings, PatternScale, FabricType, TargetArea } from '../types';

interface ControlPanelProps {
  settings: GenerationSettings;
  onUpdate: (newSettings: GenerationSettings) => void;
  disabled: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ settings, onUpdate, disabled }) => {
  
  const handleChange = (key: keyof GenerationSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const fabricTypes: FabricType[] = ['original', 'cotton', 'silk', 'denim', 'wool', 'leather', 'linen', 'velvet', 'chiffon'];
  const targetAreas: TargetArea[] = ['whole outfit', 'top', 'bottom', 'dress', 'outerwear'];
  const scales: { value: PatternScale; label: string }[] = [
    { value: 'small', label: 'Small Repeat' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large Print' },
    { value: 'original', label: 'As Is' },
  ];

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
          <Settings2 size={20} />
        </div>
        <h2 className="text-lg font-semibold text-white">Fabric Studio Controls</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fabric Type */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Palette size={16} />
            Material Simulation
          </label>
          <select 
            disabled={disabled}
            value={settings.fabricType}
            onChange={(e) => handleChange('fabricType', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
          >
            {fabricTypes.map(type => (
              <option key={type} value={type} className="capitalize">
                {type === 'original' ? 'Keep Original Texture' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Target Area */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Shirt size={16} />
            Target Garment
          </label>
          <select 
            disabled={disabled}
            value={settings.targetArea}
            onChange={(e) => handleChange('targetArea', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
          >
            {targetAreas.map(area => (
              <option key={area} value={area} className="capitalize">
                {area.replace('-', ' ').charAt(0).toUpperCase() + area.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Pattern Scale */}
        <div className="space-y-3 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Maximize size={16} />
            Pattern Scale
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {scales.map((scale) => (
              <button
                key={scale.value}
                onClick={() => handleChange('scale', scale.value)}
                disabled={disabled}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all border
                  ${settings.scale === scale.value 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-3 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <ScrollText size={16} />
            Custom Manufacturing Notes
          </label>
          <textarea
            disabled={disabled}
            value={settings.customPrompt}
            onChange={(e) => handleChange('customPrompt', e.target.value)}
            placeholder="E.g., Make the fabric look semi-transparent, add a glossy finish, stiff drape..."
            className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 text-sm"
          />
        </div>

      </div>
    </div>
  );
};
