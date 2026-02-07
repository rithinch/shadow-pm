
export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  MEETINGS = 'MEETINGS',
  ACTION_BOARD = 'ACTION_BOARD',
}

export interface TeamConfig {
  name: string;
  productDescription: string;
  members: string[];
  githubConnected: boolean;
  jiraConnected: boolean;
  slackConnected: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
  type: 'feature' | 'bug' | 'task';
  source: string;
  status: 'suggested' | 'approved' | 'synced';
}

export interface Outcome {
  id: string;
  type: 'decision' | 'priority' | 'risk' | 'question';
  content: string;
  context: string;
  status?: 'suggested' | 'approved';
}

export interface ShadowAnalysis {
  outcomes: Outcome[];
  suggestedTickets: Ticket[];
}

export interface MeetingSession {
  id: string;
  date: string;
  notes: string;
  analysis: ShadowAnalysis;
}

export interface BacklogItem {
  id: string;
  summary: string;
  status: string;
}

export interface CommitItem {
  hash: string;
  message: string;
  author: string;
  date: string;
}
