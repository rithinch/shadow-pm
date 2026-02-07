
import { BacklogItem, CommitItem, TeamConfig } from './types';

export interface DemoDataset {
  id: string;
  name: string;
  config: TeamConfig;
  backlog: BacklogItem[];
  commits: CommitItem[];
  sampleMeetingNotes: string;
}

export const DEMO_DATASETS: DemoDataset[] = [
  {
    id: 'granola',
    name: 'Granola (Meeting Notepad)',
    config: {
      name: 'Granola',
      productDescription: 'The AI notepad for people in meetings. Granola takes rough notes and turns them into a polished summary, extracting decisions and action items while preserving technical nuances and engineering context.',
      members: ['Sam (Lead Eng)', 'Jordan (Design)', 'Chris (Product)'],
      githubConnected: true,
      jiraConnected: true,
      slackConnected: true
    },
    backlog: [
      { id: 'GRA-402', summary: 'Optimize local LLM inference for offline note processing', status: 'In Progress' },
      { id: 'GRA-405', summary: 'Fix UI flicker in the "Shared with Team" view', status: 'Todo' },
      { id: 'GRA-408', summary: 'Deep link Granola notes directly into Linear issues', status: 'Todo' },
      { id: 'GRA-410', summary: 'Latency spike when generating summaries for meetings > 90min', status: 'In Progress' },
      { id: 'GRA-412', summary: 'Design: New typography system for better readability', status: 'Backlog' },
      { id: 'GRA-415', summary: 'Bug: Markdown export breaks on nested lists', status: 'Done' },
      { id: 'GRA-420', summary: 'Multi-workspace support for agency users', status: 'Backlog' },
      { id: 'GRA-422', summary: 'Refactor audio capture engine for macOS Sonoma compatibility', status: 'In Progress' }
    ],
    commits: [
      { hash: '8e2a3b', message: 'feat: add local vector store for note semantic search', author: 'Sam', date: '2023-11-01' },
      { hash: '4d5e1c', message: 'fix: eliminate race condition in audio buffer flush', author: 'Sam', date: '2023-11-02' },
      { hash: '2a9f11', message: 'style: refresh editor interface with glass styles', author: 'Jordan', date: '2023-11-02' },
      { hash: '0b4c32', message: 'chore: update gemini-flash model configuration', author: 'Sam', date: '2023-11-03' },
      { hash: 'cc3a1f', message: 'refactor: decouple note editor from sync engine', author: 'Sam', date: '2023-11-04' },
      { hash: 'ee1299', message: 'docs: clarify data privacy policy for enterprise users', author: 'Chris', date: '2023-11-04' }
    ],
    sampleMeetingNotes: `
Granola Weekly Product Sync - Nov 5th

Attendees: Sam, Jordan, Chris

Product Discussion:
- Chris: We're seeing great retention on the new AI summaries, but users want even deeper integration with their engineering workflows. Specifically, linking decisions directly to GitHub commits.
- Jordan: The note-taking experience is smooth, but the "Transfer to Linear" button is buried. We need to make it more prominent in the side panel.
- Sam: I've started the refactor for the macOS audio capture engine. It's more stable but I need to ensure we're not leaking memory on the buffer re-allocation.

Decisions:
1. Priority shift: The macOS audio stability is the #1 blocker for the upcoming release.
2. New feature: Add a "ShadowPM Sync" button that reconciles notes with recent Git activity automatically.

Next Steps:
- Sam to finish the audio engine refactor and check for memory leaks.
- Jordan to prototype the enhanced "Transfer to Linear" flow.
- Chris to define the metadata we want to capture for "Technical Decisions".
    `
  },
  {
    id: 'reewild',
    name: 'Reewild (Rewards)',
    config: {
      name: 'Reewild',
      productDescription: 'Reewild app turn day-to-day purchases into unforgettable experiences and rewards - the healthier and greener your choices, the more you earn.',
      members: ['Alice (Mobile)', 'Bob (Sustainability Ops)', 'Sarah (Growth)'],
      githubConnected: true,
      jiraConnected: true,
      slackConnected: true
    },
    backlog: [
      { id: 'REW-101', summary: 'Integrate Carbon Metrics API for real-time checkout analysis', status: 'Todo' },
      { id: 'REW-104', summary: 'UI: Green badge animation on reward earn', status: 'In Progress' },
      { id: 'REW-109', summary: 'Referral program: Double points for planet-friendly inviting', status: 'Backlog' },
      { id: 'REW-112', summary: 'Sync loyalty cards with Apple Wallet', status: 'Todo' }
    ],
    commits: [
      { hash: 'f3a2b1', message: 'feat: add carbon impact scoring algorithm', author: 'Alice', date: '2023-11-06' },
      { hash: '99d2e4', message: 'fix: checkout flow timeout on high latency', author: 'Alice', date: '2023-11-07' },
      { hash: 'a1b2c3', message: 'chore: update partner brand list', author: 'Sarah', date: '2023-11-07' }
    ],
    sampleMeetingNotes: `
Reewild Product Sync - Rewards & Sustainability

Attendees: Alice, Bob, Sarah

Current State:
- Bob: Our carbon metrics API is slightly slow during peak hours. It's affecting the "impact preview" at checkout.
- Alice: I can cache the partner brand scores locally in the app to reduce API calls. It should speed up the preview significantly.
- Sarah: We need a way to visualize the "Planet Saved" stats better in the profile. Users are earning points but not feeling the impact.

Decisions:
1. Tech: Move impact scoring to an edge function or local cache.
2. Growth: Launch "Green Friday" campaign next week.

Actions:
- Alice to implement local caching for brand scores.
- Bob to refine the sustainability taxonomy for 50 new SKU categories.
- Sarah to draft the Green Friday comms for Slack.
    `
  },
  {
    id: 'nebula-infra',
    name: 'Nebula (DevTools)',
    config: {
      name: 'Nebula Cloud',
      productDescription: 'Developer infrastructure for managing multi-cloud deployments with a focus on cost-optimization and edge compute.',
      members: ['Chris (SRE)', 'Elena (Backend)', 'Tom (PM)'],
      githubConnected: true,
      jiraConnected: false,
      slackConnected: true
    },
    backlog: [
      { id: 'NEB-11', summary: 'Optimize cold starts for AWS Lambda targets', status: 'Done' },
      { id: 'NEB-15', summary: 'Add support for GCP Cloud Run', status: 'In Progress' },
      { id: 'NEB-22', summary: 'CLI: Fix auth token expiration bug', status: 'Todo' }
    ],
    commits: [
      { hash: 'e55d21', message: 'feat: gcp cloud run controller skeleton', author: 'Elena', date: '2023-11-04' },
      { hash: 'ff32aa', message: 'fix: catch 403 errors in deployment flow', author: 'Chris', date: '2023-11-05' }
    ],
    sampleMeetingNotes: "Infrastructure sync: We need to prioritize GCP support as our biggest lead is asking for it."
  }
];
