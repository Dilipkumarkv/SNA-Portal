/**
 * Integration component: adds schematic viewer buttons to the lab views.
 */
import { useState, useCallback } from 'react';
import { SchematicData } from './SchematicViewer';
import { ALL_SCHEMATICS } from '../../data/schematics';
import { SchematicViewer, SchematicButton } from './SchematicViewer';
import { Search } from 'lucide-react';

export interface SchematicIntegrationProps {
  week: number;
  category?: string;
  variant?: 'compact' | 'full';
}

export function SchematicIntegration({ week, category, variant = 'full' }: SchematicIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSchematic, setSelectedSchematic] = useState<SchematicData | null>(null);

  // Find matching schematic by week and category
  const findSchematic = useCallback((): SchematicData | null => {
    const match =
      (category &&
        ALL_SCHEMATICS.find(s => s.week === week && s.category.toLowerCase() === category.toLowerCase())) ||
      ALL_SCHEMATICS.find(s => s.week === week);
    if (!match) return null;
    return {
      id: match.id,
      title: match.title,
      week: match.week,
      category: match.category,
      imageUrl: match.imageUrl,
      imageAlt: match.imageAlt,
      svgPath: match.svgPath,
      hotspots: match.hotspots.map((hotspot, index) => ({
        ...hotspot,
        id: `${match.id}-${index}`,
        category: match.category,
      })),
    };
  }, [week, category]);

  const schematic = findSchematic();

  const handleOpen = useCallback(() => {
    const sc = findSchematic();
    if (sc) {
      setSelectedSchematic(sc);
      setIsOpen(true);
    }
  }, [findSchematic]);

  if (!schematic) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-400">
        <Search size={14} /> No schematic available
      </div>
    );
  }

  return (
    <>
      {variant === 'compact' ? (
        <SchematicButton schematic={schematic} onOpen={handleOpen} variant="compact" />
      ) : (
        <SchematicButton schematic={schematic} onOpen={handleOpen} variant="default" />
      )}
      {isOpen && selectedSchematic && (
        <SchematicViewer schematic={selectedSchematic} onClose={() => setIsOpen(false)} isOpen={isOpen} />
      )}
    </>
  );
}
