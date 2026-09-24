import React from 'react';
import AppLayout, { type DocketStep } from './AppLayout';

export type { DocketStep };

interface DocketLayoutProps {
  currentStep: DocketStep;
  targetField?: string;
  targetRole?: string;
  onNavigate: (step: DocketStep) => void;
  onFieldChange?: (field: string) => void;
  canNavigateToField?: boolean;
  canNavigateToRole?: boolean;
  canNavigateToResume?: boolean;
  canNavigateToInterview?: boolean;
  canNavigateToATS?: boolean;
  canNavigateToSummary?: boolean;
  children: React.ReactNode;
}

export const DocketLayout: React.FC<DocketLayoutProps> = (props) => {
  return <AppLayout {...props} />;
};

export default DocketLayout;
