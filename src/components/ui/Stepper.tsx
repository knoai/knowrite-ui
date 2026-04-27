// @ts-nocheck
import { Check } from 'lucide-react';

export function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={index} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isCurrent
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? <Check size={14} /> : index + 1}
              </div>
              <span
                className={`text-[10px] whitespace-nowrap ${
                  isCurrent ? 'text-sky-400 font-medium' : isCompleted ? 'text-emerald-400/70' : 'text-slate-600'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-[2px] rounded-full transition-colors duration-300 ${
                  isCompleted ? 'bg-emerald-500/40' : 'bg-slate-800'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
