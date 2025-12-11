import React, { useState, useEffect } from 'react';
import CanvasView from './components/CanvasView';
import SettingsPanel from './components/SettingsPanel';
import { RenderSettings, DEFAULT_SETTINGS } from './types';
import { QUOTES } from './constants';
import { Maximize2, Minimize2 } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<RenderSettings>(DEFAULT_SETTINGS);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Cycle quotes occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleUpdateSettings = (newSettings: Partial<RenderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-200 text-stone-800 font-sans selection:bg-stone-300">
      
      {/* Main Canvas Renderer */}
      <CanvasView settings={settings} isFullscreen={isFullscreen} />

      {/* Top Left Title (Hidden in fullscreen mostly, or kept subtle) */}
      <div className={`absolute top-6 left-6 transition-opacity duration-500 ${isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <h1 className="font-serif italic text-2xl text-stone-800 mix-blend-hard-light drop-shadow-sm pointer-events-none">
          Monet Renderer
        </h1>
        <p className="text-xs text-stone-600 font-medium tracking-widest uppercase mt-1 opacity-70">
          Real-time Impressionism
        </p>
      </div>

      {/* Settings Panel (Top Right) */}
      <SettingsPanel 
        settings={settings} 
        updateSettings={handleUpdateSettings} 
        resetSettings={resetSettings} 
      />

      {/* Fullscreen Toggle (Bottom Right) */}
      <button 
        onClick={toggleFullscreen}
        className="absolute bottom-6 right-6 p-3 bg-white/50 backdrop-blur-md rounded-full text-stone-700 hover:bg-white hover:scale-110 transition-all shadow-sm z-40"
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* Bottom Quote */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-30 px-4">
        <p className="font-serif italic text-xl md:text-2xl text-stone-800/80 drop-shadow-md transition-all duration-1000 ease-in-out">
          {QUOTES[quoteIndex]}
        </p>
      </div>

      {/* Decorative Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(60,50,40,0.15)] z-20 mix-blend-multiply rounded-none"></div>
    </div>
  );
};

export default App;