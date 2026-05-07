export interface UserInfo {
  name: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | '';
  area: string;
}

export interface Symptom {
  id: string;
  name: string;
  category: string;
}

export interface Disease {
  name: string;
  matchPercentage: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Medication {
  name: string;
  type: string;
  dosage: string;
  notes: string;
}

export interface Prevention {
  title: string;
  description: string;
}

export interface Hospital {
  name: string;
  address: string;
  rating: number;
  distance: string;
  phone: string;
  specialties: string[];
}

export interface Doctor {
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  experience: string;
  available: boolean;
}

export interface AnalysisResult {
  diseases: Disease[];
  medications: Medication[];
  preventions: Prevention[];
  hospitals: Hospital[];
  doctors: Doctor[];
  disclaimer: string;
}

export interface FormData {
  userInfo: UserInfo;
  selectedSymptoms: string[];
  customSymptoms: string;
}
