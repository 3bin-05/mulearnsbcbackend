import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../../services/firestore';
import type { Event } from '../../types/event';
import { 
  User, 
  MapPin, 
  Monitor, 
  Award, 
  Users, 
  Share2, 
  ExternalLink, 
  ArrowLeft,
  Info,
  Clock,
  Check,
  PlayCircle,
  Video,
  Layers,
  CheckCircle2,
  ImageIcon,
  Megaphone
} from 'lucide-react';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const data = await getEvent(id);
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000); // Hide toast after 2 seconds
    } catch (err) {
      console.error('Could not copy URL to clipboard:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-slate-950 space-y-4 text-xs">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-violet-500" />
        <span className="text-slate-500 tracking-wider">Loading event details...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-slate-950 text-center px-4 text-xs space-y-6">
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 max-w-sm">
          <h2 className="text-sm font-bold text-slate-200">Event Not Found</h2>
          <p className="text-slate-500 mt-2">The event document could not be resolved. It may have been deleted or archived by the administrator.</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white hover:bg-violet-500"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 text-xs max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-slate-900 px-4 py-3 text-emerald-400 font-semibold shadow-xl animate-fade-in">
          <Check className="h-4 w-4" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* Breadcrumb Back Navigation */}
      <div>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Event Listings</span>
        </Link>
      </div>

      {/* 16:9 Banner Image */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-slate-850 shadow-xl">
        {event.wideImage ? (
          <img 
            src={event.wideImage} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
            <span className="text-[12px] uppercase tracking-widest text-slate-700 font-bold">No Banner Image Available</span>
          </div>
        )}
        
        {/* Absolute status identifier */}
        {event.status === 'running' ? (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1 text-[9px] font-bold text-white uppercase tracking-wider animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            <span>LIVE</span>
          </span>
        ) : event.status === 'past' ? (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1 text-[9px] font-bold text-slate-350 border border-slate-800 uppercase tracking-wider shadow-md">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Concluded Archive</span>
          </span>
        ) : (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1 text-[9px] font-bold text-white uppercase tracking-wider">
            <PlayCircle className="h-3 w-3 animate-pulse" />
            <span>Registration Open</span>
          </span>
        )}
      </div>

      {/* Event Overview Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Core Event Information (Left) */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <span className="inline-flex rounded-lg bg-violet-600/10 px-3 py-1 font-semibold text-violet-400 border border-violet-500/10">
              {event.category}
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              {event.title}
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              {event.shortDescription}
            </p>
          </div>

          {/* Live announcements marquee/broadcast widget */}
          {event.status === 'running' && event.announcement && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 flex items-start gap-3.5 animate-pulse">
              <Megaphone className="h-5 w-5 text-violet-400 mt-0.5 flex-shrink-0 animate-bounce" />
              <div>
                <p className="font-bold text-violet-400 text-[10px] uppercase tracking-wider">Session Broadcast Notice</p>
                <p className="text-slate-250 text-xs mt-0.5 leading-relaxed font-semibold">{event.announcement}</p>
              </div>
            </div>
          )}

          <div className="space-y-2.5 border-t border-slate-900 pt-5">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-violet-500" />
              <span>Event Details</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-xs whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Dynamic Highlights section for concluded sessions */}
          {event.status === 'past' && event.highlights && event.highlights.length > 0 && (
            <div className="space-y-3 border-t border-slate-900 pt-5">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-indigo-400" />
                <span>Session Highlights & Takeaways</span>
              </h3>
              <ul className="space-y-2">
                {event.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-slate-400 leading-relaxed text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dynamic Photo Gallery for concluded sessions */}
          {event.status === 'past' && event.gallery && event.gallery.length > 0 && (
            <div className="space-y-3 border-t border-slate-900 pt-5">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <ImageIcon className="h-4.5 w-4.5 text-indigo-400" />
                <span>Event Gallery</span>
              </h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {event.gallery.map((url, idx) => (
                  <a 
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative aspect-video rounded-xl border border-slate-900 overflow-hidden bg-slate-950 group hover:border-slate-800 transition-colors"
                  >
                    <img src={url} alt={`gallery-${idx}`} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Resources section for active sessions */}
          {event.status === 'running' && (
            <div className="space-y-3 border-t border-slate-900 pt-5">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-rose-500" />
                <span>Session Resources & Materials</span>
              </h3>
              <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-300">Interactive slides and code repositories</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Use these files to follow along with the workshop speaker.</p>
                </div>
                {event.driveLink ? (
                  <a
                    href={event.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-850 hover:text-white"
                  >
                    <span>Access Resources</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-600 font-medium">Resources will be uploaded after finalization</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Widgets Pane (Right) */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-5 space-y-5">
            
            {/* Meta facts */}
            <div className="space-y-4 text-slate-400">
              {/* Speaker */}
              <div className="flex gap-3">
                <User className="h-4.5 w-4.5 text-slate-650 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Speaker / Host</p>
                  <p className="text-slate-200 font-bold mt-0.5">{event.speaker}</p>
                </div>
              </div>

              {/* Mode & Venue */}
              <div className="flex gap-3">
                {event.mode === 'online' ? <Monitor className="h-4.5 w-4.5 text-slate-650 mt-0.5 flex-shrink-0" /> : <MapPin className="h-4.5 w-4.5 text-slate-650 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Mode & Venue</p>
                  <p className="text-slate-200 font-bold mt-0.5 capitalize">{event.mode} ({event.venue})</p>
                </div>
              </div>

              {/* Duration Schedule */}
              <div className="flex gap-3">
                <Clock className="h-4.5 w-4.5 text-slate-650 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Schedule</p>
                  <p className="text-slate-200 font-bold mt-0.5">
                    {new Date(event.startDate!).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(event.startDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Attendance count metrics overlay for past events */}
              {event.status === 'past' && event.participantsCount !== undefined && (
                <div className="flex gap-3 pt-3 border-t border-slate-900">
                  <Users className="h-4.5 w-4.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Attendance</p>
                    <p className="text-slate-200 font-bold mt-0.5">{event.participantsCount} Attendees</p>
                  </div>
                </div>
              )}

              {/* Certificates & Participants limits (only shown for non-finalized events) */}
              {event.status !== 'past' && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-900 text-[10px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Max: {event.maxParticipants || 'Unlim.'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-orange-450 flex-shrink-0" />
                    <span>Cert: {event.certificateAvailable ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Buttons */}
            <div className="space-y-2.5 pt-3 border-t border-slate-900">
              {event.status === 'running' ? (
                null
              ) : event.status === 'past' ? (
                <div className="space-y-2 w-full text-[11px] font-bold">
                  {event.recordingLink ? (
                    <a
                      href={event.recordingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition-colors"
                    >
                      <Video className="h-4 w-4" />
                      <span>Watch Recording</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900/40 border border-slate-900/60 px-4 py-2.5 text-slate-655 cursor-not-allowed"
                    >
                      <span>No Recording Shared</span>
                    </button>
                  )}

                  {event.driveLink ? (
                    <a
                      href={event.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-850 bg-slate-905 px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-500" />
                      <span>Access Slides / Repo</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900/40 border border-slate-900/60 px-4 py-2.5 text-slate-655 cursor-not-allowed"
                    >
                      <span>No Slides Shared</span>
                    </button>
                  )}
                </div>
              ) : (
                event.registrationLink ? (
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-bold text-white hover:bg-violet-500 shadow-lg shadow-violet-600/10 transition-colors"
                  >
                    <span>Register Now</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 font-bold text-slate-500 cursor-not-allowed"
                  >
                    <span>Registration Link Closed</span>
                  </button>
                )
              )}

              <button
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-850 bg-slate-905 px-4 py-3 font-semibold text-slate-350 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Event Link</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default EventDetails;
