import React, { useState } from 'react';
import { updateEvent } from '../../services/firestore';
import type { Event } from '../../types/event';
import { 
  Calendar, 
  User, 
  MapPin, 
  Monitor, 
  Megaphone, 
  XCircle, 
  Trash2,
  Loader2
} from 'lucide-react';

interface RunningEventsProps {
  events: Event[];
}

export const RunningEvents: React.FC<RunningEventsProps> = ({ events }) => {
  // Filter for running events
  const runningEvents = events.filter((e) => e.status === 'running');

  // Input announcements per eventId
  const [announcements, setAnnouncements] = useState<Record<string, string>>({});
  
  // Submit states per eventId
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleTextChange = (eventId: string, val: string) => {
    setAnnouncements((prev) => ({
      ...prev,
      [eventId]: val,
    }));
  };

  const handlePostAnnouncement = async (eventId: string) => {
    const text = (announcements[eventId] || '').trim();
    if (!text) return;

    setLoadingStates((prev) => ({ ...prev, [eventId]: true }));
    try {
      await updateEvent(eventId, { announcement: text });
      alert('Live announcement posted successfully.');
      setAnnouncements((prev) => ({ ...prev, [eventId]: '' }));
    } catch (err: any) {
      console.error(err);
      alert(`Failed to post announcement: ${err?.message || err}`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleClearAnnouncement = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete the active announcement?')) {
      setLoadingStates((prev) => ({ ...prev, [eventId]: true }));
      try {
        await updateEvent(eventId, { announcement: '' }); // Clear by setting to empty string
        alert('Live announcement cleared.');
      } catch (err: any) {
        console.error(err);
        alert(`Failed to clear announcement: ${err?.message || err}`);
      } finally {
        setLoadingStates((prev) => ({ ...prev, [eventId]: false }));
      }
    }
  };

  const handleEndSessionEarly = async (eventId: string, title: string) => {
    if (window.confirm(`Are you sure you want to end "${title}" early? This will update the end time to now and move it to the Needs Finalization tab.`)) {
      setLoadingStates((prev) => ({ ...prev, [eventId]: true }));
      try {
        await updateEvent(eventId, { 
          endDate: new Date().toISOString() 
        });
        alert('Event ended successfully. It is now flagged for finalization.');
      } catch (err: any) {
        console.error(err);
        alert(`Failed to close event: ${err?.message || err}`);
      } finally {
        setLoadingStates((prev) => ({ ...prev, [eventId]: false }));
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      <div className="border-b border-slate-900 pb-3">
        <h2 className="text-base font-bold text-slate-200">Live Active Sessions</h2>
        <p className="text-xs text-slate-500 mt-1">
          Currently running live events. Admins can monitor sessions, broadcast live announcements, or conclude events early.
        </p>
      </div>

      {runningEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {runningEvents.map((event) => {
            const isLoading = loadingStates[event.id] || false;
            const announcementText = announcements[event.id] || '';

            return (
              <div
                key={event.id}
                className="relative rounded-2xl border border-slate-900 bg-slate-950 overflow-hidden flex flex-col hover:border-slate-800 transition-all duration-300 group"
              >
                {/* Loader Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                    <Loader2 className="h-7 w-7 text-violet-500 animate-spin" />
                  </div>
                )}

                {/* Event wide image header */}
                {event.wideImage ? (
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={event.wideImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Live Status Badge */}
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      LIVE
                    </span>
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-rose-900/20 to-slate-900 relative flex items-center justify-center">
                    <span className="text-rose-400 font-bold tracking-widest text-sm uppercase">Active Workshop</span>
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      LIVE
                    </span>
                  </div>
                )}

                {/* Event Body content */}
                <div className="p-5 flex-grow space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                      {event.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-200 mt-1 leading-snug">
                      {event.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 border-t border-slate-900/60 pt-3.5 text-slate-500">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      <span className="truncate">{event.speaker}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.mode === 'online' ? <Monitor className="h-4 w-4 text-slate-600 flex-shrink-0" /> : <MapPin className="h-4 w-4 text-slate-600 flex-shrink-0" />}
                      <span className="truncate capitalize">{event.mode} ({event.venue})</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Calendar className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      <span>
                        {new Date(event.startDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Active Announcement Status */}
                  {event.announcement ? (
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5 flex items-start gap-2.5">
                      <Megaphone className="h-4.5 w-4.5 text-violet-400 mt-0.5 flex-shrink-0 animate-bounce" />
                      <div className="flex-grow space-y-1">
                        <p className="font-semibold text-violet-400 text-[10px] uppercase tracking-wider">Active Broadcast</p>
                        <p className="text-slate-300 text-xs leading-relaxed">{event.announcement}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleClearAnnouncement(event.id)}
                        className="rounded-lg p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 cursor-pointer"
                        title="Clear Announcement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-900 bg-slate-950 p-3.5 flex items-start gap-2">
                      <Megaphone className="h-4 w-4 text-slate-650 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">No announcements broadcasted yet.</span>
                    </div>
                  )}

                  {/* Post New Announcement Form */}
                  <div className="space-y-2 border-t border-slate-900/60 pt-4">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Broadcast Live Announcement
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={announcementText}
                        onChange={(e) => handleTextChange(event.id, e.target.value)}
                        placeholder="e.g. Join the Discord voice channel now!"
                        className="flex-grow rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-650 focus:border-violet-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handlePostAnnouncement(event.id)}
                        disabled={!announcementText.trim()}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-850 px-4 py-2 font-bold text-violet-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                {/* Moderation Controls Footer */}
                <div className="border-t border-slate-900 bg-slate-950 p-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => handleEndSessionEarly(event.id, event.title)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-950 bg-rose-500/10 hover:bg-rose-550/20 px-4 py-2 font-bold text-rose-500 cursor-pointer transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>End Session Early</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 py-12 text-center text-slate-600">
          No live events are running at the moment.
        </div>
      )}
    </div>
  );
};

export default RunningEvents;
