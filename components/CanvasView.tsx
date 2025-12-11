import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RenderSettings } from '../types';
import { MONET_PALETTES } from '../constants';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface CanvasViewProps {
  settings: RenderSettings;
  isFullscreen: boolean;
}

// Particle Class: Represents a "Fish" or "Brush Stroke"
class PaintParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  width: number;
  height: number;
  
  // "Personality" of the fish/stroke
  wigglePhase: number;  // Starting phase for tail wagging
  wiggleSpeed: number;  // How fast it wiggles
  sizeVariation: number; // Some are fat, some are thin

  // Individual color offset
  rOffset: number;
  gOffset: number;
  bOffset: number;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.wigglePhase = Math.random() * Math.PI * 2;
    this.wiggleSpeed = 2 + Math.random() * 3; // Fast oscillation
    this.sizeVariation = 0.8 + Math.random() * 0.4;
    
    this.rOffset = (Math.random() - 0.5) * 20;
    this.gOffset = (Math.random() - 0.5) * 20;
    this.bOffset = (Math.random() - 0.5) * 20;
    
    this.reset(w, h);
  }

  reset(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    
    this.age = 0;
    this.life = Math.random() * 100 + 50; // Longer life
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
  }

  update(targetAngle: number, speed: number, wiggleAmount: number, time: number) {
    // 1. Calculate Wiggle (Fish Tail Motion)
    // High frequency sine wave added to the direction
    const wiggle = Math.sin(time * this.wiggleSpeed + this.wigglePhase) * wiggleAmount;
    
    // 2. Determine target velocity vector
    // The particle tries to align with the edge flow (targetAngle) + its own wiggle
    const moveAngle = targetAngle + wiggle;
    
    const targetVx = Math.cos(moveAngle) * speed;
    const targetVy = Math.sin(moveAngle) * speed;
    
    // 3. Smooth steering (Inertia)
    // Fish don't turn instantly, they steer.
    this.vx += (targetVx - this.vx) * 0.15;
    this.vy += (targetVy - this.vy) * 0.15;

    this.x += this.vx;
    this.y += this.vy;
    this.age++;

    // Wrap around screen or respawn if too old
    if (this.age > this.life) {
      this.reset(this.width, this.height);
    }
    if (this.x < -50) this.x = this.width + 50;
    if (this.x > this.width + 50) this.x = -50;
    if (this.y < -50) this.y = this.height + 50;
    if (this.y > this.height + 50) this.y = -50;
  }
}

const CanvasView: React.FC<CanvasViewProps> = ({ settings, isFullscreen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<PaintParticle[]>([]);
  const requestRef = useRef<number>(0);
  
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsStreaming(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
        },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(`Camera Error: ${err.message || "Unknown error"}`);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [startCamera]);

  // Initialize Particles
  useEffect(() => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    
    const targetCount = settings.particleCount;
    const currentCount = particlesRef.current.length;
    
    if (currentCount < targetCount) {
        for (let i = 0; i < targetCount - currentCount; i++) {
            particlesRef.current.push(new PaintParticle(w, h));
        }
    } else if (currentCount > targetCount) {
        particlesRef.current.splice(targetCount);
    }
  }, [settings.particleCount]);

  // Main Render Loop
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !hiddenCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const hCanvas = hiddenCanvasRef.current;
    const hCtx = hCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx || !hCtx) return;

    const resizeCanvas = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      hCanvas.width = 720; 
      hCanvas.height = Math.floor(720 * (h/w)) || 480;
      particlesRef.current.forEach(p => p.reset(w, h));
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const currentPalette = MONET_PALETTES.find(p => p.id === settings.paletteId) || MONET_PALETTES[0];

    const renderFrame = () => {
      if (!isStreaming || !videoRef.current || videoRef.current.readyState < 2) {
        requestRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      try {
        // 1. Process Video (Mirrored)
        hCtx.save();
        hCtx.translate(hCanvas.width, 0);
        hCtx.scale(-1, 1);
        hCtx.drawImage(videoRef.current, 0, 0, hCanvas.width, hCanvas.height);
        hCtx.restore();
        
        const frameData = hCtx.getImageData(0, 0, hCanvas.width, hCanvas.height).data;

        // 2. Trails / Fade effect
        // A warmer, slightly more opaque fade helps the shapes stand out like distinct brush strokes
        ctx.fillStyle = `rgba(240, 238, 230, 0.15)`; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;
        const hw = hCanvas.width;
        const hh = hCanvas.height;
        const scaleX = hw / w;
        const scaleY = hh / h;

        const time = Date.now() * 0.001;

        particlesRef.current.forEach(p => {
          // Map to source
          const sx = Math.floor(p.x * scaleX);
          const sy = Math.floor(p.y * scaleY);
          
          if (sx < 0 || sx >= hw - 1 || sy < 0 || sy >= hh - 1) {
              p.reset(w, h);
              return;
          }

          const idx = (sy * hw + sx) * 4;
          const r = frameData[idx];
          const g = frameData[idx + 1];
          const b = frameData[idx + 2];

          // --- Sobel Edge Detection for Flow Direction ---
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          
          const idxX = (sy * hw + Math.min(sx + 1, hw - 1)) * 4;
          const lumX = 0.299 * frameData[idxX] + 0.587 * frameData[idxX+1] + 0.114 * frameData[idxX+2];

          const idxY = (Math.min(sy + 1, hh - 1) * hw + sx) * 4;
          const lumY = 0.299 * frameData[idxY] + 0.587 * frameData[idxY+1] + 0.114 * frameData[idxY+2];

          const dx = lumX - lum;
          const dy = lumY - lum;
          const edgeMag = Math.sqrt(dx*dx + dy*dy);
          
          // Flow direction: Perpendicular to gradient + 90deg usually gives contour flow
          let flowAngle = Math.atan2(dy, dx) + Math.PI / 2;

          // --- Update Physics (Swim) ---
          const wiggleAmount = settings.swirl * 1.5; // Amplify the wiggle effect
          
          // Speed depends on flow intensity but can be dampened by edge magnitude (slow down on sharp edges to draw details)
          const adaptiveSpeed = settings.flowIntensity * (1 + Math.random() * 0.5); 

          p.update(flowAngle, adaptiveSpeed, wiggleAmount, time);

          // --- Color Mapping ---
          let targetColor: number[] = [r, g, b];
          if (lum < 80) targetColor = currentPalette.toneMapping.shadows;
          else if (lum > 175) targetColor = currentPalette.toneMapping.highlights;
          else targetColor = currentPalette.toneMapping.midtones;

          const mixStrength = 0.55; 
          let finalR = r * (1 - mixStrength) + targetColor[0] * mixStrength;
          let finalG = g * (1 - mixStrength) + targetColor[1] * mixStrength;
          let finalB = b * (1 - mixStrength) + targetColor[2] * mixStrength;

          // Vibrance
          const avg = (finalR + finalG + finalB) / 3;
          finalR = avg + (finalR - avg) * settings.colorVibrance + p.rOffset;
          finalG = avg + (finalG - avg) * settings.colorVibrance + p.gOffset;
          finalB = avg + (finalB - avg) * settings.colorVibrance + p.bOffset;

          const colorString = `rgba(${Math.max(0, Math.floor(finalR))}, ${Math.max(0, Math.floor(finalG))}, ${Math.max(0, Math.floor(finalB))}, ${settings.opacity})`;

          // --- Drawing: Oriented Ellipse (The "Fish/Brush" Look) ---
          ctx.beginPath();
          ctx.fillStyle = colorString;
          
          // Calculate Rotation: Strictly aligns with velocity
          const rotation = Math.atan2(p.vy, p.vx);
          
          // Dimensions
          // Length: Elongated based on Stroke Length setting
          const length = settings.strokeLength * p.sizeVariation;
          // Width: Based on Brush Size setting
          const thickness = settings.brushSize * p.sizeVariation;

          // Detail Enhancement:
          // If on a strong edge, make stroke thinner and shorter for precision
          const edgeFactor = Math.min(edgeMag / 30, 1.0);
          const finalLength = length * (1 - edgeFactor * 0.3);
          const finalThickness = thickness * (1 - edgeFactor * 0.5);

          ctx.ellipse(
            p.x, 
            p.y, 
            finalLength, 
            finalThickness, 
            rotation, 
            0, 
            2 * Math.PI
          );
          ctx.fill();
        });
      } catch (e) {
        // ignore
      }

      requestRef.current = requestAnimationFrame(renderFrame);
    };

    requestRef.current = requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [settings, isStreaming]);

  return (
    <div className={`relative w-full h-full bg-stone-200 overflow-hidden ${isFullscreen ? 'cursor-none' : ''}`}>
      <video ref={videoRef} className="hidden" muted playsInline />
      <canvas ref={hiddenCanvasRef} className="hidden" />
      <canvas ref={canvasRef} className="block w-full h-full object-cover touch-none" />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100/90 backdrop-blur-sm z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-200 flex flex-col items-center max-w-md text-center">
            <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4"><AlertCircle size={32} /></div>
            <h3 className="font-serif text-2xl text-stone-800 mb-2 font-medium">Camera Access</h3>
            <p className="text-stone-500 mb-8 leading-relaxed">{error}</p>
            <button onClick={startCamera} className="flex items-center gap-2 px-8 py-3 bg-stone-800 text-stone-50 rounded-full hover:bg-stone-700 hover:scale-105 transition-all shadow-lg font-medium tracking-wide">
                <RefreshCw size={18} /> Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasView;