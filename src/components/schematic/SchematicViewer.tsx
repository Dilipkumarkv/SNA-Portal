import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Info, ExternalLink, Search, RotateCcw } from 'lucide-react';

export interface Hotspot {
  id?: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
  description: string;
  category?: string;
  specs?: string[];
  commonIssues?: string[];
  videoUrl?: string;
  wikiUrl?: string;
}

export interface SchematicData {
  id: string;
  title: string;
  week: number;
  category: string;
  imageUrl?: string; // photograph of the real hardware
  imageAlt?: string;
  svgPath?: string; // inline SVG content
  hotspots: Hotspot[];
}

interface SchematicViewerProps {
  schematic: SchematicData;
  onClose: () => void;
  isOpen: boolean;
}

export function SchematicViewer({ schematic, onClose, isOpen }: SchematicViewerProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset transform on close/open
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      setSelectedHotspot(null);
    }
  }, [isOpen]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.5), 5);
    
    // Zoom towards cursor
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;
      
      setTranslate(prev => ({
        x: centerX - (centerX - prev.x) * (newScale / scale),
        y: centerY - (centerY - prev.y) * (newScale / scale),
      }));
    }
    setScale(newScale);
  }, [scale]);

  // Handle touch pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      (containerRef.current as any).__initialDistance = distance;
      (containerRef.current as any).__initialScale = scale;
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && (containerRef.current as any).__initialDistance) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const initialDistance = (containerRef.current as any).__initialDistance;
      const initialScale = (containerRef.current as any).__initialScale;
      
      const newScale = Math.min(Math.max(initialScale * (distance / initialDistance), 0.5), 5);
      setScale(newScale);
    }
  }, []);

  // Handle pan (mouse)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !selectedHotspot) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    }
  }, [translate, selectedHotspot]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setTranslate({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle touch pan (single finger)
  const handleTouchStartPan = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && !selectedHotspot) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - translate.x, y: e.touches[0].clientY - translate.y });
    }
  }, [translate, selectedHotspot]);

  const handleTouchMovePan = useCallback((e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      e.preventDefault();
      setTranslate({ x: e.touches[0].clientX - panStart.x, y: e.touches[0].clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Double-tap to reset zoom
  const handleDoubleClick = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div
        ref={containerRef}
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-full max-h-full overflow-hidden flex flex-col"
        style={{ width: '100%', height: '100%' }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStartCapture={handleTouchStartPan}
        onTouchMoveCapture={handleTouchMovePan}
        onTouchEndCapture={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0 sm:gap-4 sm:p-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-lg">{schematic.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded sm:text-xs">Week {schematic.week}</span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium rounded sm:text-xs">{schematic.category}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              onClick={() => setScale(Math.min(scale * 1.2, 5))}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors sm:p-2"
              aria-label="Zoom in"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setScale(Math.max(scale / 1.2, 0.5))}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors sm:p-2"
              aria-label="Zoom out"
            >
              <Search size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button
              onClick={handleDoubleClick}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors sm:p-2"
              aria-label="Reset view"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors sm:p-2"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Zoom indicator */}
        <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
          Zoom: {Math.round(scale * 100)}% {scale !== 1 && '(Double-click to reset)'}
        </div>

        {/* Diagram viewport */}
        <div 
          className="flex-1 overflow-hidden relative"
          style={{ 
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: 'transform 0.1s ease-out'
          }}
        >
          <div className="relative w-full">
            {schematic.imageUrl ? (
              <img
                src={schematic.imageUrl}
                alt={schematic.imageAlt ?? schematic.title}
                className="block w-full select-none"
                draggable={false}
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: schematic.svgPath ?? '' }} />
            )}

            {/* Hotspots */}
            {schematic.hotspots.map(hotspot => (
              <button
                key={hotspot.id ?? hotspot.label}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspot(hotspot);
                }}
                className="absolute rounded-full border-2 transition-all duration-200"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 'max(44px, 4vw)',
                  height: 'max(44px, 4vw)',
                  minWidth: '44px',
                  minHeight: '44px',
                  borderColor: selectedHotspot?.label === hotspot.label ? '#6366f1' : '#22c55e',
                  backgroundColor: selectedHotspot?.label === hotspot.label ? 'rgba(99, 102, 241, 0.2)' : 'rgba(34, 197, 94, 0.15)',
                  boxShadow: selectedHotspot?.label === hotspot.label ? '0 0 0 3px rgba(99, 102, 241, 0.4)' : '0 0 0 2px rgba(34, 197, 94, 0.3)',
                  animation: 'pulse 2s infinite',
                }}
                aria-label={hotspot.label}
              >
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  !
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Hotspot Detail Panel */}
        {selectedHotspot && (
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0 max-h-[40vh] overflow-y-auto animate-slide-up">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedHotspot.label}</h3>
                {selectedHotspot.category && (
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded">{selectedHotspot.category}</span>
                )}
              </div>
              <button onClick={() => setSelectedHotspot(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={20} /></button>
            </div>
            
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{selectedHotspot.description}</p>
            
            {selectedHotspot.specs && selectedHotspot.specs.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Specifications</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                  {selectedHotspot.specs.map((spec, i) => <li key={i}>{spec}</li>)}
                </ul>
              </div>
            )}
            
            {selectedHotspot.commonIssues && selectedHotspot.commonIssues.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                  <Info size={12} /> Common Issues
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                  {selectedHotspot.commonIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              </div>
            )}
            
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedHotspot.videoUrl && (
                <a href={selectedHotspot.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  <ExternalLink size={12} /> Video Guide
                </a>
              )}
              {selectedHotspot.wikiUrl && (
                <a href={selectedHotspot.wikiUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                  <Info size={12} /> Learn More
                </a>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3); }
            50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.1); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.2s ease-out; }
        `}</style>
      </div>
    </div>
  );
}

// Schematic button component for integration into tabs
export function SchematicButton({ 
  schematic, 
  onOpen, 
  variant = 'default' 
}: { 
  schematic: SchematicData; 
  onOpen: () => void;
  variant?: 'default' | 'compact';
}) {
  if (variant === 'compact') {
    return (
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
      >
        <Search size={12} /> View Schematic
      </button>
    );
  }
  
  return (
    <button
      onClick={onOpen}
      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all shadow-sm"
    >
      <Search size={18} className="text-indigo-600 dark:text-indigo-400" />
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">View {schematic.title} Schematic</span>
    </button>
  );
}