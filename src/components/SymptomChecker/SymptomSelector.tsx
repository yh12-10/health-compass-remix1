import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSymptoms, useSymptomCategories, DBSymptom } from '@/hooks/useMedicalData';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  customSymptoms: string;
  onSymptomsChange: (symptoms: string[]) => void;
  onCustomSymptomsChange: (custom: string) => void;
}

const SymptomSelector = ({
  selectedSymptoms,
  customSymptoms,
  onSymptomsChange,
  onCustomSymptomsChange,
}: SymptomSelectorProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  // Fetch from Supabase
  const { data: symptoms = [], isLoading: symptomsLoading } = useSymptoms();
  const { data: categories = [], isLoading: categoriesLoading } = useSymptomCategories();

  const categoryNames = categories.map(c => c.name);
  const [activeCategory, setActiveCategory] = useState('');

  // Set default active category once loaded
  if (!activeCategory && categoryNames.length > 0) {
    setActiveCategory(categoryNames[0]);
  }

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      onSymptomsChange(selectedSymptoms.filter((id) => id !== symptomId));
    } else {
      onSymptomsChange([...selectedSymptoms, symptomId]);
    }
  };

  const getSymptomName = (id: string) => {
    const symptom = symptoms.find((s) => s.id === id);
    if (!symptom) return id;
    return isArabic ? symptom.name_ar || symptom.name : symptom.name;
  };

  const getTranslatedCategory = (category: string) => {
    return t(`categories.${category}`) || category;
  };

  const isLoading = symptomsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ms-3 text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          {t('symptoms.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('symptoms.subtitle')}
        </p>
      </div>

      {/* Selected symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="p-4 bg-medical-teal-light rounded-lg border border-primary/20">
          <Label className="text-sm font-medium text-primary mb-3 block">
            {t('symptoms.selected')} ({selectedSymptoms.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleSymptom(id)}
              >
                {getSymptomName(id)}
                <X className="w-3 h-3 ms-2" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start">
          {categoryNames.map((category) => {
            const count = symptoms.filter(
              (s) =>
                s.category_name === category && selectedSymptoms.includes(s.id)
            ).length;
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full border border-border data-[state=active]:border-primary"
              >
                {getTranslatedCategory(category)}
                {count > 0 && (
                  <span className="ms-2 bg-medical-green text-white text-xs px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categoryNames.map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {symptoms
                .filter((s) => s.category_name === category)
                .map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom.id);
                  const displayName = isArabic
                    ? symptom.name_ar || symptom.name
                    : symptom.name;
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-start',
                        isSelected
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'border-2 border-muted-foreground/30'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-medium">{displayName}</span>
                    </button>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Custom symptoms */}
      <div className="space-y-3 pt-4 border-t border-border">
        <Label
          htmlFor="custom-symptoms"
          className="flex items-center gap-2 text-base"
        >
          <Plus className="w-4 h-4 text-primary" />
          {t('symptoms.additional')}
        </Label>
        <Textarea
          id="custom-symptoms"
          placeholder={t('symptoms.additionalPlaceholder')}
          value={customSymptoms}
          onChange={(e) => onCustomSymptomsChange(e.target.value)}
          className="min-h-[120px] resize-none"
        />
      </div>
    </div>
  );
};

export default SymptomSelector;
