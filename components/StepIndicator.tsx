import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-600 text-white scale-110 shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span className={`text-xs mt-2 ${isActive ? 'text-brand-400' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
            {stepNumber < steps.length && (
              <div
                className={`w-12 h-1 mx-2 rounded transition-colors duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-slate-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;