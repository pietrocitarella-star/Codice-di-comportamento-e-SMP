export type TabType = 'guida' | 'simulatore' | 'analizzatore' | 'quiz' | 'strumenti' | 'debriefing';

export type ClassroomSessionId =
  | '27_ottobre_mattina'
  | '27_ottobre_pomeriggio'
  | '28_ottobre_mattina'
  | '28_ottobre_pomeriggio';

export interface ClassroomSessionInfo {
  id: ClassroomSessionId;
  day: '27 Ottobre' | '28 Ottobre';
  slot: 'Mattina' | 'Pomeriggio';
  time: string;
  label: string;
}

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

export interface AnonymousSubmission {
  id: string;
  caseId: string;
  choice: 'Verde' | 'Giallo' | 'Rosso';
  sessionId: ClassroomSessionId;
  timestamp: number;
}

export interface CaseDebriefStats {
  caseId: string;
  title: string;
  context: string;
  correctCategory: 'Verde' | 'Giallo' | 'Rosso';
  quote: string;
  totalAnswers: number;
  counts: {
    Verde: number;
    Giallo: number;
    Rosso: number;
  };
  percentages: {
    Verde: number;
    Giallo: number;
    Rosso: number;
  };
  correctPercentage: number;
  mostCommonPitfall: string;
  discussionQuestion: string;
  legalFocus: string;
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
