import type { Event, EventStatus } from '../types/event';

export const calculateEventStatus = (
  event: Omit<Event, 'status'> & { status?: EventStatus }
): EventStatus => {
  const now = new Date();
  
  // Date parses — both are optional; Coming Soon events have neither
  const start = event.startDate ? new Date(event.startDate!) : null;
  const end = event.endDate ? new Date(event.endDate!) : null;

  // 1. Past checking — event has ended
  if (end && now >= end) {
    return 'past';
  }

  // 2. Running checking — registration opened or event has started
  if (end && now < end) {
    if (event.registrationOpenDate) {
      const regOpen = new Date(event.registrationOpenDate);
      if (now >= regOpen) {
        return 'running';
      }
    }
    if (start && now >= start) {
      return 'running';
    }
  }

  // 3. Fallback — no dates set, or all dates are in the future → Coming Soon
  return 'coming-soon';
};
