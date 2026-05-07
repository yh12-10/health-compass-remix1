import { useTranslation } from 'react-i18next';
import { AnalysisResult } from '@/types/symptom-checker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Stethoscope,
  Pill,
  Shield,
  Building2,
  UserRound,
  Star,
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsViewProps {
  results: AnalysisResult;
}

const ResultsView = ({ results }: ResultsViewProps) => {
  const { t } = useTranslation();

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'medical-badge-success';
      case 'medium':
        return 'medical-badge-warning';
      case 'high':
        return 'medical-badge-danger';
    }
  };

  const getSeverityLabel = (severity: 'low' | 'medium' | 'high') => {
    return t(`results.severity.${severity}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          {t('results.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('results.subtitle')}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-medical-orange-light border border-medical-orange/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-medical-orange mt-0.5 flex-shrink-0" />
        <p className="text-sm text-medical-orange">
          <strong>{t('results.important')}:</strong> {results.disclaimer}
        </p>
      </div>

      {/* Possible Diseases */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            {t('results.possibleConditions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {results.diseases.map((disease, index) => (
            <div
              key={disease.name}
              className={cn(
                'p-5 transition-colors hover:bg-muted/30',
                index !== results.diseases.length - 1 && 'border-b'
              )}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="font-semibold text-foreground">
                      {disease.name}
                    </h4>
                    <span className={getSeverityColor(disease.severity)}>
                      {getSeverityLabel(disease.severity)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {disease.description}
                  </p>
                </div>
                <div className="text-end flex-shrink-0">
                  <div className="text-2xl font-bold text-primary">
                    {disease.matchPercentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">{t('results.match')}</div>
                </div>
              </div>
              <Progress value={disease.matchPercentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-medical-blue/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-medical-blue/10 rounded-lg">
              <Pill className="w-5 h-5 text-medical-blue" />
            </div>
            {t('results.suggestedMedications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {results.medications.map((med) => (
              <div
                key={med.name}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{med.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {med.type}
                  </Badge>
                </div>
                <p className="text-sm text-primary font-medium mb-1">
                  {med.dosage}
                </p>
                <p className="text-xs text-muted-foreground">{med.notes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prevention */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-medical-green/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-medical-green/10 rounded-lg">
              <Shield className="w-5 h-5 text-medical-green" />
            </div>
            {t('results.prevention')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4">
            {results.preventions.map((prevention, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-muted/30"
              >
                <div className="w-8 h-8 rounded-full bg-medical-green/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-medical-green">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {prevention.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {prevention.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hospitals */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-medical-purple/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-medical-purple/10 rounded-lg">
              <Building2 className="w-5 h-5 text-medical-purple" />
            </div>
            {t('results.nearbyHospitals')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {results.hospitals.map((hospital) => (
              <div
                key={hospital.name}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-foreground">
                    {hospital.name}
                  </h4>
                  <div className="flex items-center gap-1 text-medical-orange">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{hospital.rating}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{hospital.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{hospital.phone}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hospital.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className="text-xs"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doctors */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-accent/10 rounded-lg">
              <UserRound className="w-5 h-5 text-accent" />
            </div>
            {t('results.recommendedDoctors')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {results.doctors.map((doctor) => (
              <div
                key={doctor.name}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {doctor.name}
                    </h4>
                    <p className="text-sm text-primary">{doctor.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1 text-medical-orange">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{doctor.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {doctor.hospital}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {doctor.experience}
                  </span>
                  <Badge
                    variant={doctor.available ? 'default' : 'secondary'}
                    className={cn(
                      'text-xs',
                      doctor.available && 'bg-medical-green text-white'
                    )}
                  >
                    {doctor.available ? t('results.available') : t('results.busy')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsView;
