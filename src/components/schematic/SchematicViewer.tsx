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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4">
      <div
        ref={containerRef}
        className="relative flex max-h-full w-full max-w-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-raise"
        style={{ height: '100%' }}
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
        <div className="safe-top flex shrink-0 items-center gap-2 border-b border-line bg-surface p-2 sm:gap-4 sm:p-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-sm font-semibold text-ink sm:text-lg">{schematic.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-text">Week {schematic.week}</span>
              <span className="rounded bg-sunken px-2 py-0.5 text-xs text-ink-2">{schematic.category}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setScale(Math.min(scale * 1.2, 5))}
              className="grid h-9 w-9 place-items-center rounded-control border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink sm:h-10 sm:w-10"
              aria-label="Zoom in"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setScale(Math.max(scale / 1.2, 0.5))}
              className="grid h-9 w-9 place-items-center rounded-control border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink sm:h-10 sm:w-10"
              aria-label="Zoom out"
            >
              <Search size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button
              onClick={handleDoubleClick}
              className="grid h-9 w-9 place-items-center rounded-control border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink sm:h-10 sm:w-10"
              aria-label="Reset view"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-control border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink sm:h-10 sm:w-10"
              aria-label="Close viewer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b border-line bg-sunken px-3 py-1 text-center text-xs text-ink-3">
          {Math.round(scale * 100)}% zoom · drag to pan, double-click to reset
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
            {schematic.hotspots.map((hotspot, index) => {
              const active = selectedHotspot?.label === hotspot.label;
              return (
                <button
                  key={hotspot.id ?? hotspot.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHotspot(hotspot);
                  }}
                  className="absolute rounded-full border-2 transition-transform"
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 'max(44px, 4vw)',
                    height: 'max(44px, 4vw)',
                    minWidth: '44px',
                    minHeight: '44px',
                    borderColor: active ? '#ffffff' : 'rgba(255,255,255,0.85)',
                    backgroundColor: active ? 'rgba(79,70,229,0.75)' : 'rgba(79,70,229,0.32)',
                  }}
                  aria-label={hotspot.label}
                  aria-pressed={active}
                >
                  <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-brand text-[9px] font-bold text-white">
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hotspot Detail Panel */}
        {selectedHotspot && (
          <div className="safe-bottom max-h-[40vh] shrink-0 overflow-y-auto border-t border-line bg-surface p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-semibold text-ink">{selectedHotspot.label}</h3>
                {selectedHotspot.category && (
                  <span className="mt-1 inline-block rounded bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-text">{selectedHotspot.category}</span>
                )}
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="grid h-8 w-8 place-items-center rounded-control text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
                aria-label="Close details"
              >
                <X size={17} />
              </button>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-ink-2">{selectedHotspot.description}</p>

            {selectedHotspot.specs && selectedHotspot.specs.length > 0 && (
              <div className="mt-3">
                <h4 className="mb-1 text-xs font-semibold text-ink">Specifications</h4>
                <ul className="list-disc space-y-1 pl-4 text-sm text-ink-2 marker:text-ink-3">
                  {selectedHotspot.specs.map((spec, i) => <li key={i}>{spec}</li>)}
                </ul>
              </div>
            )}

            {selectedHotspot.commonIssues && selectedHotspot.commonIssues.length > 0 && (
              <div className="mt-3">
                <h4 className="mb-1 flex items-center gap-1 text-xs font-semibold text-ink">
                  <Info size={12} className="text-ink-3" /> Common issues
                </h4>
                <ul className="list-disc space-y-1 pl-4 text-sm text-ink-2 marker:text-ink-3">
                  {selectedHotspot.commonIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedHotspot.videoUrl && (
                <a href={selectedHotspot.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-control bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-hover">
                  <ExternalLink size={12} /> Video guide
                </a>
              )}
              {selectedHotspot.wikiUrl && (
                <a href={selectedHotspot.wikiUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-line px-3 text-xs font-semibold text-ink-2 transition-colors hover:border-line-strong hover:text-ink">
                  <Info size={12} /> Learn more
                </a>
              )}
            </div>
          </div>
        )}
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
        className="inline-flex min-h-10 items-center gap-1.5 rounded-control border border-line px-3 text-xs font-semibold text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
      >
        <Search size={13} /> View schematic
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-line-strong hover:bg-sunken sm:w-auto"
    >
      <Search size={17} className="text-ink-3" />
      View {schematic.title}
    </button>
  );
}