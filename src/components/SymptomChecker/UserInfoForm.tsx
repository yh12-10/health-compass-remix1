import { useTranslation } from 'react-i18next';
import { UserInfo } from '@/types/symptom-checker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Calendar, MapPin } from 'lucide-react';

interface UserInfoFormProps {
  userInfo: UserInfo;
  onChange: (userInfo: UserInfo) => void;
}

const UserInfoForm = ({ userInfo, onChange }: UserInfoFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          {t('userInfo.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('userInfo.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {t('userInfo.name')}
          </Label>
          <Input
            id="name"
            placeholder={t('userInfo.namePlaceholder')}
            value={userInfo.name}
            onChange={(e) => onChange({ ...userInfo, name: e.target.value })}
            className="h-12"
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age" className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {t('userInfo.age')}
          </Label>
          <Input
            id="age"
            type="number"
            placeholder={t('userInfo.agePlaceholder')}
            min={1}
            max={120}
            value={userInfo.age ?? ''}
            onChange={(e) =>
              onChange({
                ...userInfo,
                age: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="h-12"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {t('userInfo.gender')}
          </Label>
          <Select
            value={userInfo.gender}
            onValueChange={(value: 'male' | 'female' | 'other') =>
              onChange({ ...userInfo, gender: value })
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder={t('userInfo.genderPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('userInfo.male')}</SelectItem>
              <SelectItem value="female">{t('userInfo.female')}</SelectItem>
              <SelectItem value="other">{t('userInfo.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Area */}
        <div className="space-y-2">
          <Label htmlFor="area" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {t('userInfo.area')}
          </Label>
          <Input
            id="area"
            placeholder={t('userInfo.areaPlaceholder')}
            value={userInfo.area}
            onChange={(e) => onChange({ ...userInfo, area: e.target.value })}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
};

export default UserInfoForm;
