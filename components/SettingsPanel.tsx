import React from 'react';
import { Settings, RefreshCw, Palette as PaletteIcon, Wind, Brush } from 'lucide-react';
import { RenderSettings, Palette } from '../types';
import { MONET_PALETTES } from '../constants';

interface SettingsPanelProps {
  settings: RenderSettings;
  updateSettings: (newSettings: Partial<RenderSettings>) => void;
  resetSettings: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, updateSettings, resetSettings }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  // Helper for slider components
  const Slider = ({ label, value, min, max, step, settingKey }: any) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">{label}</label>
        <span className="text-xs text-stone-500 font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => updateSettings({ [settingKey]: parseFloat(e.target.value) })}
        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-500 hover:accent-stone-600 transition-all"
      />
    </div>
  );

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'w-80' : 'w-12'} flex flex-col items-end`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white text-stone-600 border border-stone-200 transition-all hover:scale-105"
      >
        <Settings size={20} />
      </button>

      {/* Main Panel */}
      <div className={`w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-200/50 overflow-hidden transition-all duration-500 origin-top-right ${isOpen ? 'opacity-100 max-h-[85vh]' : 'opacity-0 max-h-0 pointer-events-none'}`}>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-xl font-medium text-stone-800 italic">Monet Studio</h2>
            <button onClick={resetSettings} title="Reset Presets" className="text-stone-400 hover:text-stone-600 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Section: Palette */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-stone-700">
              <PaletteIcon size={16} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Palette Mood</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {MONET_PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => updateSettings({ paletteId: p.id })}
                  className={`relative p-3 rounded-lg text-left transition-all border ${
                    settings.paletteId === p.id 
                      ? 'bg-stone-100 border-stone-400 shadow-sm' 
                      : 'bg-transparent border-transparent hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-sm font-medium text-stone-800">{p.name}</span>
                  <div className="flex gap-1 mt-2">
                    {p.colors.map((c) => (
                      <div key={c} className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Brush */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-stone-700">
              <Brush size={16} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Brush & Stroke</h3>
            </div>
            <Slider label="Brush Size" value={settings.brushSize} min={2} max={30} step={1} settingKey="brushSize" />
            <Slider label="Stroke Length" value={settings.strokeLength} min={2} max={50} step={1} settingKey="strokeLength" />
            <Slider label="Particle Count" value={settings.particleCount} min={1000} max={15000} step={500} settingKey="particleCount" />
            <Slider label="Opacity" value={settings.opacity} min={0.1} max={1} step={0.05} settingKey="opacity" />
          </div>

          {/* Section: Flow */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3 text-stone-700">
              <Wind size={16} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Color & Flow</h3>
            </div>
            <Slider label="Vibrance" value={settings.colorVibrance} min={0.5} max={2.0} step={0.1} settingKey="colorVibrance" />
            <Slider label="Flow Intensity" value={settings.flowIntensity} min={0} max={5} step={0.1} settingKey="flowIntensity" />
            <Slider label="Swirl / Turbulence" value={settings.swirl} min={0} max={2} step={0.1} settingKey="swirl" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;