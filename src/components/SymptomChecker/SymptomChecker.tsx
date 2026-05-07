import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormData, AnalysisResult, UserInfo } from '@/types/symptom-checker';
import { useSymptoms } from '@/hooks/useMedicalData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StepIndicator from './StepIndicator';
import UserInfoForm from './UserInfoForm';
import SymptomSelector from './SymptomSelector';
import ResultsView from './ResultsView';
import LoadingAnalysis from './LoadingAnalysis';
import { ArrowLeft, ArrowRight, Send, RotateCcw } from 'lucide-react';

const initialFormData: FormData = {
  userInfo: {
    name: '',
    age: null,
    gender: '',
    area: '',
  },
  selectedSymptoms: [],
  customSymptoms: '',
};

const SymptomChecker = () => {
  const { t, i18n } = useTranslation();
  const { data: symptoms = [] } = useSymptoms();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const previousLanguage = useRef(i18n.language);

  const steps = [
    { id: 1, title: t('steps.yourInfo') },
    { id: 2, title: t('steps.symptoms') },
    { id: 3, title: t('steps.results') },
  ];

  const updateUserInfo = (userInfo: UserInfo) => {
    setFormData((prev) => ({ ...prev, userInfo }));
  };

  const updateSymptoms = (symptoms: string[]) => {
    setFormData((prev) => ({ ...prev, selectedSymptoms: symptoms }));
  };

  const updateCustomSymptoms = (custom: string) => {
    setFormData((prev) => ({ ...prev, customSymptoms: custom }));
  };

  const canProceedToStep2 = () => {
    const { name, age, gender, area } = formData.userInfo;
    return name.trim() && age && age > 0 && gender && area.trim();
  };

  const canProceedToStep3 = () => {
    return (
      formData.selectedSymptoms.length > 0 ||
      formData.customSymptoms.trim().length > 0
    );
  };

  const getSymptomNames = () => {
    return formData.selectedSymptoms.map(
      (id) => symptoms.find((s) => s.id === id)?.name || id
    );
  };

  const runAnalysis = async (language: string) => {
    setIsLoading(true);
    setCurrentStep(3);

    try {
      // Always request analysis in English for reliability
      const { data, error } = await supabase.functions.invoke('analyze-symptoms', {
        body: {
          userInfo: formData.userInfo,
          symptoms: getSymptomNames(),
          customSymptoms: formData.customSymptoms,
          language: 'en',
        },
      });

      if (error) throw error;

      // If language is not English, translate the results
      if (language !== 'en' && data && !data.error) {
        setResults(data); // Show English results first while translating
        setIsLoading(false);
        setIsTranslating(true);
        try {
          const { data: translatedData, error: translateError } = await supabase.functions.invoke('translate-results', {
            body: {
              results: data,
              targetLanguage: language,
            },
          });

          if (!translateError && translatedData && !translatedData.error) {
            setResults(translatedData);
          } else {
            console.error('Translation failed, keeping English results:', translateError);
          }
        } catch (translateErr) {
          console.error('Translation error:', translateErr);
        } finally {
          setIsTranslating(false);
        }
      } else {
        setResults(data);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('common.error'));
      if (!results) {
        setCurrentStep(2);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    await runAnalysis(i18n.language);
  };

  // Translate existing results when language changes (instead of regenerating)
  const translateResults = async (targetLanguage: string) => {
    if (!results) return;

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-results', {
        body: {
          results: results,
          targetLanguage: targetLanguage,
        },
      });

      if (error) throw error;

      if (data && !data.error) {
        setResults(data);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(t('common.error'));
    } finally {
      setIsTranslating(false);
    }
  };

  // Translate results when language changes on results page
  useEffect(() => {
    if (previousLanguage.current !== i18n.language && currentStep === 3 && results && !isLoading && !isTranslating) {
      previousLanguage.current = i18n.language;
      translateResults(i18n.language);
    } else {
      previousLanguage.current = i18n.language;
    }
  }, [i18n.language]);

  const handleReset = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setResults(null);
  };

  const renderStepContent = () => {
    if (currentStep === 3 && isLoading) {
      return <LoadingAnalysis />;
    }

    if (currentStep === 3 && results) {
      return (
        <div className="relative">
          {isTranslating && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-3 text-primary">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">{t('common.loading')}</span>
              </div>
            </div>
          )}
          <ResultsView results={results} />
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <UserInfoForm
            userInfo={formData.userInfo}
            onChange={updateUserInfo}
          />
        );
      case 2:
        return (
          <SymptomSelector
            selectedSymptoms={formData.selectedSymptoms}
            customSymptoms={formData.customSymptoms}
            onSymptomsChange={updateSymptoms}
            onCustomSymptomsChange={updateCustomSymptoms}
          />
        );
      default:
        return null;
    }
  };

  const renderNavigation = () => {
    if (currentStep === 3) {
      return (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t('results.startNew')}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-between pt-6 border-t border-border mt-8">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Button>

        {currentStep === 1 && (
          <Button
            onClick={() => setCurrentStep(2)}
            disabled={!canProceedToStep2()}
            size="lg"
            className="gap-2"
          >
            {t('common.next')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}

        {currentStep === 2 && (
          <Button
            onClick={handleAnalyze}
            disabled={!canProceedToStep3()}
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-medical-blue hover:opacity-90"
          >
            <Send className="w-4 h-4" />
            {t('symptoms.analyzeButton')}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-medical-blue p-6 md:p-8">
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        {renderStepContent()}
        {renderNavigation()}
      </div>
    </Card>
  );
};

export default SymptomChecker;
