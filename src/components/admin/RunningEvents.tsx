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
  Loader2,
  PlayCircle,
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
        await updateEvent(eventId, { announcement: '' });
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
      
      <div className="pb-3 border-b border-[#e9e1f8]">
        <div className="flex items-center gap-2 mb-1">
          <PlayCircle className="h-5 w-5 text-[#6b2ff2]" />
          <h2 className="text-base font-bold text-[#1f2433]">Live Active Sessions</h2>
        </div>
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
                className="sbc-card relative overflow-hidden flex flex-col"
              >
                {/* Loader Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                    <Loader2 className="h-7 w-7 text-[#6b2ff2] animate-spin" />
                  </div>
                )}

                {/* Event wide image header */}
                {event.wideImage ? (
                  <div className="relative h-44 bg-[#f4edff] overflow-hidden rounded-t-2xl">
                    <img
                      src={event.wideImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
                    
                    {/* Live Status Badge */}
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      LIVE
                    </span>
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-[#f0e5ff] to-[#e8d5ff] rounded-t-2xl relative flex items-center justify-center">
                    <span className="text-[#6b2ff2] font-bold tracking-widest text-sm uppercase opacity-60">
                      Active {event.eventType || 'workshop'}
                    </span>
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      LIVE
                    </span>
                  </div>
                )}

                {/* Event Body content */}
                <div className="p-5 flex-grow space-y-4">
                  <div>
                    <span className="sbc-kicker">
                      {event.category}
                    </span>
                    <h3 className="text-sm font-bold text-[#1f2433] mt-1 leading-snug">
                      {event.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 border-t border-[#e9e1f8] pt-3.5 text-slate-500">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#b990ff] flex-shrink-0" />
                      <span className="truncate">{event.speaker || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.mode === 'online' ? <Monitor className="h-4 w-4 text-[#b990ff] flex-shrink-0" /> : <MapPin className="h-4 w-4 text-[#b990ff] flex-shrink-0" />}
                      <span className="truncate capitalize">{event.mode} ({event.venue})</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Calendar className="h-4 w-4 text-[#b990ff] flex-shrink-0" />
                      <span>
                        {new Date(event.startDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Active Announcement Status */}
                  {event.announcement ? (
                    <div className="rounded-xl border border-[#d4baff] bg-[#f4edff] p-3.5 flex items-start gap-2.5">
                      <Megaphone className="h-4 w-4 text-[#6b2ff2] mt-0.5 flex-shrink-0 animate-bounce" />
                      <div className="flex-grow space-y-1">
                        <p className="font-semibold text-[#6b2ff2] text-[10px] uppercase tracking-wider">Active Broadcast</p>
                        <p className="text-[#4a3a6a] text-xs leading-relaxed">{event.announcement}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleClearAnnouncement(event.id)}
                        className="rounded-lg p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                        title="Clear Announcement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#e9e1f8] bg-[#fbf9ff] p-3.5 flex items-start gap-2">
                      <Megaphone className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-400">No announcements broadcasted yet.</span>
                    </div>
                  )}

                  {/* Post New Announcement Form */}
                  <div className="space-y-2 border-t border-[#e9e1f8] pt-4">
                    <label className="sbc-label">
                      Broadcast Live Announcement
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={announcementText}
                        onChange={(e) => handleTextChange(event.id, e.target.value)}
                        placeholder="e.g. Join the Discord voice channel now!"
                        className="sbc-input flex-grow"
                      />
                      <button
                        type="button"
                        onClick={() => handlePostAnnouncement(event.id)}
                        disabled={!announcementText.trim()}
                        className="sbc-button-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                {/* Moderation Controls Footer */}
                <div className="border-t border-[#e9e1f8] bg-[#fbf9ff] p-4 flex justify-end gap-3 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => handleEndSessionEarly(event.id, event.title)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 font-bold text-red-600 cursor-pointer transition-colors text-xs"
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
        <div className="rounded-2xl border border-dashed border-[#d4baff] bg-[#fbf9ff] py-12 text-center text-slate-500">
          No live events are running at the moment.
        </div>
      )}
    </div>
  );
};

export default RunningEvents;
