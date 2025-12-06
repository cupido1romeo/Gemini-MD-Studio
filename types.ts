export enum ViewMode {
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW',
  SPLIT = 'SPLIT'
}

export type Theme = 'light' | 'dark';
export type Layout = 'horizontal' | 'vertical';

export interface AiResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export enum AiActionType {
  PROOFREAD = 'PROOFREAD',
  SUMMARIZE = 'SUMMARIZE',
  CONTINUE = 'CONTINUE',
  FORMAT = 'FORMAT'
}