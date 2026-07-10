import React, { useState } from 'react';
import {
  Award,
  Calendar,
  ExternalLink,
  Eye,
  Film,
  ImageIcon,
  Info,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { deleteEvent } from '../../services/firestore';
import type { Event } from '../../types/event';

interface PastEventsProps {
  events: Event[];
}

export const PastEvents: React.FC<PastEventsProps> = ({ events }) => {
  const pastEvents = events.filter((e) => e.status === 'past');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const totalAttendees = pastEvents.reduce((acc, curr) => acc + (curr.participantsCount || 0), 0);
  const avgAttendance = pastEvents.length > 0 ? Math.round(totalAttendees / pastEvents.length) : 0;

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the archived event "${title}"? This action is irreversible.`)) {
      try {
        await deleteEvent(id);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert(`Failed to delete event: ${message}`);
      }
    }
  };

  return (
    <div className="space-y-11 animate-fade-in text-sm relative pb-80 lg:pb-0">
      <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1f2433]">
            Historical <span className="font-script text-[#6b2ff2] text-4xl font-bold">Event Archive</span>
          </h2>
          <p className="text-base text-slate-500 mt-3">
            Concluded sessions that have been finalized and published.
          </p>
          <div className="sbc-title-mark" />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="sbc-panel min-w-56 px-7 py-5 flex items-center gap-5">
            <Users className="h-8 w-8 text-[#6b2ff2]" />
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Avg. Attendance</p>
              <p className="text-lg font-extrabold text-[#1f2433] mt-1">{avgAttendance} learners</p>
            </div>
          </div>
          <div className="sbc-panel min-w-56 px-7 py-5 flex items-center gap-5">
            <Award className="h-8 w-8 text-[#6b2ff2]" />
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Archived Sessions</p>
              <p className="text-lg font-extrabold text-[#1f2433] mt-1">{pastEvents.length} events</p>
            </div>
          </div>
        </div>
      </div>

      {pastEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
          {pastEvents.map((event) => (
            <div
              key={event.id}
              className="sbc-card max-w-xl overflow-hidden flex flex-col group p-8 space-y-8 justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="sbc-kicker">
                      {event.category} - Concluded {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                    </span>
                    <h3 className="font-script text-[#1f2433] text-3xl font-bold mt-5 group-hover:text-[#5a20df] transition-colors leading-snug">
                      {event.title}
                    </h3>
                    <div className="mt-6 h-0.5 w-12 rounded-full bg-[#b389ff]" />
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#6b2ff2] bg-[#eadbff] px-3 py-1.5 rounded-xl font-bold">
                    <Users className="h-3.5 w-3.5" />
                    <span>{event.participantsCount || 0} attended</span>
                  </span>
                </div>

                {event.highlights && event.highlights.length > 0 && (
                  <div className="space-y-1.5 bg-[#fcfbff] border border-[#efe6fb] p-4 rounded-xl">
                    <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Key Highlights</span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-1 mt-1 text-xs leading-relaxed line-clamp-2">
                      {event.highlights.slice(0, 2).map((highlight, index) => (
                        <li key={index} className="line-clamp-1">{highlight}</li>
                      ))}
                      {event.highlights.length > 2 && (
                        <li className="list-none text-slate-600 italic">+{event.highlights.length - 2} more...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8 pt-2 text-slate-500 text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <Film className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>{event.recordingLink ? 'Recording linked' : 'No Recording'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>{event.gallery?.length || 0} Gallery photos</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="sbc-button-primary flex-grow"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Review Archive</span>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id, event.title)}
                    className="rounded-xl border border-[#ffb8c8] bg-white/80 text-rose-500 hover:bg-[#fff0f3] px-4 py-3 cursor-pointer transition-colors"
                    title="Delete Archive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sbc-panel border-dashed py-12 text-center text-slate-500">
          No past events have been published yet.
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-sm p-4">
          <div className="sbc-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-scale-in text-[#1f2433]">
            <div className="flex items-center justify-between border-b border-[#efe6fb] px-6 py-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-[#eadbff] text-[#6b2ff2] px-3 py-1 text-[10px] font-bold tracking-wide uppercase">
                  Published Archive Report
                </span>
                <h3 className="text-base font-bold text-[#1f2433] mt-2">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1.5 border border-[#efe6fb] hover:bg-[#f8f4ff] text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              <div className="grid gap-4 sm:grid-cols-2 text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Users className="h-5 w-5 text-[#6b2ff2] mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-500 text-[10px] uppercase">Attendance Score</p>
                    <p className="text-[#1f2433] font-bold mt-0.5">{selectedEvent.participantsCount || 0} Attendees</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-5 w-5 text-[#6b2ff2] mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-500 text-[10px] uppercase">Duration Schedule</p>
                    <p className="text-[#1f2433] font-bold mt-0.5">
                      {selectedEvent.startDate ? new Date(selectedEvent.startDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedEvent.highlights && selectedEvent.highlights.length > 0 && (
                <div className="space-y-2 border-t border-[#f4edff] pt-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Award className="h-5 w-5 text-[#6b2ff2]" />
                    <span>Concluded Highlights</span>
                  </h4>
                  <ul className="list-disc pl-5 text-slate-600 space-y-2 leading-relaxed">
                    {selectedEvent.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEvent.gallery && selectedEvent.gallery.length > 0 && (
                <div className="space-y-2 border-t border-[#f4edff] pt-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="h-5 w-5 text-[#6b2ff2]" />
                    <span>Uploaded Session Gallery ({selectedEvent.gallery.length} photos)</span>
                  </h4>
                  <div className="grid gap-3.5 grid-cols-3">
                    {selectedEvent.gallery.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative aspect-video rounded-xl border border-[#efe6fb] overflow-hidden bg-slate-50 group shadow-sm hover:shadow-md transition-all"
                      >
                        <img src={url} alt={`gallery-${index}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 border-t border-[#f4edff] pt-4">
                <div>
                  <span className="mb-1.5 flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase">
                    <Film className="h-3.5 w-3.5 text-slate-400" />
                    <span>Recording Link</span>
                  </span>
                  {selectedEvent.recordingLink ? (
                    <a href={selectedEvent.recordingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold text-[#6b2ff2] hover:underline">
                      <span>Watch video recording</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No recording uploaded</span>
                  )}
                </div>
                <div>
                  <span className="mb-1.5 flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase">
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                    <span>Resource Drive</span>
                  </span>
                  {selectedEvent.driveLink ? (
                    <a href={selectedEvent.driveLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold text-[#6b2ff2] hover:underline">
                      <span>Access slides / code files</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No slide drives shared</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-[#efe6fb] px-6 py-4 flex justify-end">
              <button onClick={() => setSelectedEvent(null)} className="sbc-button-muted">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastEvents;
