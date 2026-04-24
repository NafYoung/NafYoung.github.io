export interface Profile {
  displayName: string
  englishName: string
  role: string
  headline: string
  summary: string
  status: string
  location: string
  mission: string
  badges: string[]
  proofPoints: Array<{
    label: string
    value: string
    detail: string
  }>
}

export interface Trait {
  title: string
  englishLabel: string
  description: string
}

export interface Project {
  title: string
  year: string
  tags: string[]
  summary: string
  challenge: string
  build: string
  outcome: string
  proofPoints: string[]
}

export interface WorkflowStep {
  step: string
  title: string
  description: string
}

export interface TimelineItem {
  period: string
  title: string
  subtitle: string
  description: string
}

export interface ContactInfo {
  githubLabel: string
  githubUrl: string
  email: string
  note: string
}

export interface SiteContent {
  profile: Profile
  traits: Trait[]
  projects: Project[]
  workflow: WorkflowStep[]
  timeline: TimelineItem[]
  contact: ContactInfo
}
