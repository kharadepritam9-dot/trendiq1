import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Sparkles, 
  Compass, 
  Lightbulb, 
  CheckCircle2, 
  Loader2, 
  Terminal,
  FastForward
} from 'lucide-react';

interface AnalysisLoadingProps {
  onComplete: () => void;
}

interface Step {
  id: number;
  label: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const steps: Step[] = [
  {
    id: 1,
    label: 'Analyzing content performance',
    subtext: 'Ingesting 126 posts, Reel view medians, and save-to-view ratios...',
    icon: BarChart2,
    color: 'text-indigo-400',
  },
  {
    id: 2,
    label: 'Detecting content patterns',
    subtext: 'Identifying top format: talking-head reels with text hooks outperform montages by 3.4x...',
    icon: Sparkles,
    color: 'text-violet-400',
  },
  {
    id: 3,
    label: 'Checking trend signals',
    subtext: 'Comparing Google Trends snapshot across Nutrition, Cardio, Supplements, and Mobility...',
    icon: Compass,
    color: 'text-amber-400',
  },
  {
    id: 4,
    label: 'Finding content opportunities',
    subtext: 'Calculating Opportunity Scores (0–100) and validating 5-pillar fits...',
    icon: Lightbulb,
    color: 'text-emerald-400',
  },
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [logMessages, setLogMessages] = useState<string[]>([
    'Initializing TrendIQ content engine for @fitnesswithananya...',
  ]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentStepIndex(1);
      setProgress(40);
      setLogMessages((prev) => [
        ...prev,
        'Found highest retention pillar: "High-Protein Desk Meals" (24.6K avg views)',
      ]);
    }, 1000);

    const timer2 = setTimeout(() => {
      setCurrentStepIndex(2);
      setProgress(68);
      setLogMessages((prev) => [
        ...prev,
        'Matched Google Trends snapshot: +340% Breakout for Cottage Cheese Flatbread',
      ]);
    }, 2000);

    const timer3 = setTimeout(() => {
      setCurrentStepIndex(3);
      setProgress(92);
      setLogMessages((prev) => [
        ...prev,
        'Generating Opportunity Scores & "Why this idea?" breakdown across 5 pillars...',
      ]);
    }, 3000);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setLogMessages((prev) => [
        ...prev,
        'Pipeline complete. 4 high-scoring content opportunities unlocked!',
      ]);
    }, 3900);

    const timerComplete = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timerComplete);
    };
  }, [onComplete]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-6 sm:p-9 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Subtle glowing ambient pulse */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 mb-4 shadow-inner">
            <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Synthesizing Intelligence
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Evaluating @fitnesswithananya Instagram performance against Google Trends snapshot
          </p>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-2">
              <span>ANALYSIS PIPELINE</span>
              <span className="text-indigo-400 font-bold">{progress}%</span>
            </div>
            <div className="h-2.5 w-full bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-lg shadow-indigo-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Required Steps */}
        <div className="mt-8 space-y-3.5">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || progress === 100;
            const isCurrent = idx === currentStepIndex && progress < 100;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 ${
                  isCurrent
                    ? 'bg-neutral-800/80 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : isCompleted
                    ? 'bg-neutral-950/40 border-neutral-800/60'
                    : 'bg-neutral-950/20 border-neutral-800/20 opacity-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-neutral-700 flex items-center justify-center text-xs text-neutral-400 font-mono">
                      {step.id}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${isCurrent ? 'text-white' : isCompleted ? 'text-neutral-200' : 'text-neutral-400'}`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 animate-pulse">
                        Scanning
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-400 mt-1 leading-normal">
                    {step.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live log ticker */}
        <div className="mt-7 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 font-mono text-xs text-neutral-400 flex items-center gap-2 overflow-hidden">
          <Terminal className="w-4 h-4 text-neutral-500 shrink-0" />
          <div className="truncate text-neutral-300">
            {logMessages[logMessages.length - 1]}
          </div>
        </div>

        {/* Skip button for quick evaluation */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors py-1 px-3 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            <FastForward className="w-4 h-4" />
            <span>Fast-track to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
