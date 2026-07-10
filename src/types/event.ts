export type EventStatus = 'coming-soon' | 'registration-open' | 'running' | 'needs-finalization' | 'past';

export interface Event {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  speaker: string;
  category: string;
  venue: string;
  mode: 'online' | 'offline';
  comingSoonOnly?: boolean;
  registrationOpenDate?: string;
  registrationCloseDate?: string;
  startDate?: string;
  endDate?: string;
  registrationLink?: string;
  maxParticipants?: number;
  certificateAvailable: boolean;
  cardImage?: string;
  wideImage?: string;
  status: EventStatus;
  participantsCount?: number;
  highlights?: string[];
  recordingLink?: string;
  driveLink?: string;
  gallery?: string[];
  announcement?: string;
}
