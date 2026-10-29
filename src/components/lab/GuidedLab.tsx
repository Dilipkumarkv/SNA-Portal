import { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Check, Circle, Terminal, BookOpen } from 'lucide-react';
import { getScenariosForLab } from '../../data/labScenarios';
import { CLScenario } from '../terminal/TerminalComponents';
import { SchematicIntegration } from '../schematic/SchematicIntegration';

interface GuidedLabProps {
  labId: number;
  labTitle: string;
  labSteps: string[];
  onLaunchTerminal: (scenarioId: string) => void;
}

export function GuidedLab({ labId, labTitle, labSteps, onLaunchTerminal }: GuidedLabProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
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
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setExpandedStep(currentStep + 1);
    }
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setExpandedStep(currentStep - 1);
    }
  }, [currentStep]);

  const currentScenario = scenarios.length > 0 ? scenarios[0] : null;
  const hasSchematic = [1, 2, 3, 4, 10].includes(labId);
  const schematicCategory = labId === 2 ? 'smps' : labId >= 10 ? 'network' : 'motherboard';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Guide Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
            Experiment {labId}: {labTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Guided Mode — Follow each step to complete the lab</p>
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          {showGuide ? 'Hide Guide' : 'Show Guide'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
          <span className={`font-bold tabular-nums ${progress === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {labSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentStep(i); setExpandedStep(i); }}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                completedSteps.has(i) ? 'bg-emerald-500' : i === currentStep ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      {showGuide && (
        <div className="p-4 sm:p-5 space-y-3">
          <div className="mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Current Step: {currentStep + 1} of {totalSteps}</span>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{labSteps[currentStep]}</h4>
          </div>

          {/* Step Actions */}
          <div className="flex flex-wrap gap-2">
            {/* Schematic Button */}
            {hasSchematic && (
              <div className="flex-1 min-w-[200px]">
                <SchematicIntegration week={labId === 3 ? 3 : labId === 2 ? 2 : labId >= 10 ? 10 : 1} category={schematicCategory} />
              </div>
            )}

            {/* Terminal Button */}
            {currentScenario && (
              <button
                onClick={() => onLaunchTerminal(currentScenario.id)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <Terminal size={16} /> Practice in Terminal
              </button>
            )}
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
            <button
              onClick={goPrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleStepComplete(currentStep)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  completedSteps.has(currentStep) 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800'
                }`}
              >
                <Check size={16} /> {completedSteps.has(currentStep) ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
            
            <button
              onClick={goNext}
              disabled={currentStep >= totalSteps - 1}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
