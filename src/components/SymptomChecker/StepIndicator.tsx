import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'step-indicator transition-all duration-300',
                currentStep === step.id && 'step-indicator-active',
                currentStep > step.id && 'step-indicator-completed',
                currentStep < step.id && 'step-indicator-pending'
              )}
            >
              {currentStep > step.id ? (
                <Check className="w-5 h-5" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={cn(
                'mt-2 text-xs font-medium hidden md:block',
                currentStep >= step.id
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-8 md:w-16 h-0.5 mx-2 transition-colors duration-300',
                currentStep > step.id ? 'bg-medical-green' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
