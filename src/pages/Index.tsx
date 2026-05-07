import { useTranslation } from 'react-i18next';
import SymptomChecker from '@/components/SymptomChecker/SymptomChecker';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Stethoscope, Shield, Clock, Brain } from 'lucide-react';

const Index = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      title: t('features.aiPowered'),
      description: t('features.aiPoweredDesc'),
    },
    {
      icon: Shield,
      title: t('features.reliable'),
      description: t('features.reliableDesc'),
    },
    {
      icon: Clock,
      title: t('features.instant'),
      description: t('features.instantDesc'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-medical-blue/5 to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Language Switcher */}
        <div className="absolute top-4 end-4 z-10">
          <LanguageSwitcher />
        </div>
        
        <div className="container relative py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Stethoscope className="w-4 h-4" />
              {t('hero.badge')}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
              <span className="gradient-text">{t('hero.title1')}</span>
              <br />
              <span className="text-foreground">{t('hero.title2')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 md:py-12">
        <SymptomChecker />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{t('common.appName')}</span>
            </div>
            <p className="text-center md:text-end">
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
