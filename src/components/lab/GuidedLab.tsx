import { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Check, BookOpen, Terminal } from 'lucide-react';
import { getScenariosForLab } from '../../data/labScenarios';
import { SchematicIntegration } from '../schematic/SchematicIntegration';

interface GuidedLabProps {
  labId: number;
  labSteps: string[];
  onLaunchTerminal: (scenarioId: string) => void;
}

export function GuidedLab({ labId, labSteps, onLaunchTerminal }: GuidedLabProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showGuide, setShowGuide] = useState(true);

  const scenarios = getScenariosForLab(labId);
  const totalSteps = labSteps.length;
  const progress = Math.round((completedSteps.size / totalSteps) * 100);

  const toggleStepComplete = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepIndex)) next.delete(stepIndex);
      else next.add(stepIndex);
      return next;
    });
  }, []);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const currentScenario = scenarios.length > 0 ? scenarios[0] : null;
  const hasSchematic = [1, 2, 3, 4, 10].includes(labId);
  const schematicCategory = labId === 2 ? 'smps' : labId >= 10 ? 'network' : 'motherboard';

  return (
    <div className="overflow-hidden rounded-control border border-line">
      <div className="flex items-center justify-between gap-3 border-b border-line p-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <BookOpen size={15} className="text-ink-3" /> Guided walkthrough
        </h4>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="rounded-control px-2.5 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:bg-brand-soft"
        >
          {showGuide ? 'Hide steps' : 'Show steps'}
        </button>
      </div>

      {showGuide && (
        <>
          <div className="border-b border-line px-3 py-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-ink-3">{completedSteps.size} of {totalSteps} steps done</span>
              <span className={`font-semibold tabular-nums ${progress === 100 ? 'text-success' : 'text-ink'}`}>{progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sunken">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-success' : 'bg-brand'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {labSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    completedSteps.has(i) ? 'bg-success' : i === currentStep ? 'bg-brand' : 'bg-line-strong'
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 p-3">
            <div>
              <span className="text-xs font-semibold text-ink-3">Step {currentStep + 1} of {totalSteps}</span>
              <h5 className="mt-0.5 text-sm font-semibold leading-snug text-ink">{labSteps[currentStep]}</h5>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {hasSchematic && (
                <SchematicIntegration week={labId === 3 ? 3 : labId === 2 ? 2 : labId >= 10 ? 10 : 1} category={schematicCategory} variant="compact" />
              )}
              {currentScenario && (
                <button
                  onClick={() => onLaunchTerminal(currentScenario.id)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-control bg-brand px-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                >
                  <Terminal size={15} /> Practice in Terminal
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
              <button
                onClick={goPrev}
                disabled={currentStep === 0}
                className="inline-flex min-h-10 items-center gap-1 rounded-control px-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink disabled:cursor-default disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                onClick={() => toggleStepComplete(currentStep)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-control px-3 text-sm font-semibold transition-colors ${
                  completedSteps.has(currentStep)
                    ? 'bg-success-soft text-success'
                    : 'border border-line text-ink-2 hover:border-line-strong hover:text-ink'
                }`}
                aria-pressed={completedSteps.has(currentStep)}
              >
                <Check size={15} /> {completedSteps.has(currentStep) ? 'Step done' : 'Mark step done'}
              </button>

              <button
                onClick={goNext}
                disabled={currentStep >= totalSteps - 1}
                className="inline-flex min-h-10 items-center gap-1 rounded-control px-2 text-sm font-semibold text-brand-text transition-colors hover:text-ink disabled:cursor-default disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
