export type TabType = 'guida' | 'simulatore' | 'analizzatore' | 'quiz' | 'strumenti';

export interface TrafficLightCase {
  id: string;
  category: 'Verde' | 'Giallo' | 'Rosso';
  title: string;
  context: 'Bacheca Pubblica' | 'Gruppo WhatsApp' | 'LinkedIn' | 'Foto & Storie' | 'Commenti ai Media';
  quote: string;
  verdict: string;
  legalBasis: string;
  practicalAdvice: string;
  iconName: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  context: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface RoleResponsibility {
  role: string;
  badge: string;
  generalDuty: number;
  exemplarityDuty: number;
  description: string;
  guidelines: string[];
}

export interface CertificateData {
  studentName: string;
  organization: string;
  role: string;
  issueDate: string;
  score: number;
  certificateCode: string;
}
