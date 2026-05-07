import { useTranslation } from 'react-i18next';
import { Loader2, Brain, Search, FileText, Building2 } from 'lucide-react';

const LoadingAnalysis = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Brain, label: t('loading.step1') },
    { icon: Search, label: t('loading.step2') },
    { icon: FileText, label: t('loading.step3') },
    { icon: Building2, label: t('loading.step4') },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-medical-blue flex items-center justify-center animate-pulse-soft">
          <Brain className="w-12 h-12 text-white" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
      </div>

      <h3 className="text-xl font-display font-bold text-foreground mb-2">
        {t('loading.title')}
      </h3>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        {t('loading.subtitle')}
      </p>

      <div className="space-y-4 w-full max-w-sm">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 animate-slide-up"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <step.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground flex-1">
              {step.label}
            </span>
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingAnalysis;
