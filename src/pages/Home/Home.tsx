import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToEvents } from '../../services/firestore';
import type { Event } from '../../types/event';
import { 
  Sparkles, 
  PlusCircle, 
  ArrowRight, 
  BookOpen, 
  Users, 
  Trophy, 
  Layers,
  Monitor,
  MapPin,
  Clock,
  PlayCircle,
  Eye,
  CheckCircle2,
  X,
  User,
  Calendar,
  Lock,
  Megaphone
} from 'lucide-react';

export const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for coming soon details popup
  const [selectedComingSoon, setSelectedComingSoon] = useState<Event | null>(null);

  // Subscribe to real-time events from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter events dynamically based on calculated status
  const runningEvents = events.filter((e) => e.status === 'running');
  const registrationOpenEvents = events.filter((e) => e.status === 'registration-open');
  const comingSoonEvents = events.filter((e) => e.status === 'coming-soon');
  const pastEvents = events.filter((e) => e.status === 'past');

  // Features list
  const features = [
    {
      icon: BookOpen,
      title: 'Sticky Note Events',
      description: 'Discover upcoming events and sessions styled as modern sticky notes. Never miss a future learning opportunity.',
      color: 'from-violet-500/20 to-amber-500/10 text-violet-400',
    },
    {
      icon: Users,
      title: 'Live Interactive Sessions',
      description: 'Track and participate in active events. Access meeting links, resource repositories, and real-time announcements.',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
    },
    {
      icon: Trophy,
      title: 'Digital Credentials',
      description: 'Verify attendance and retrieve digital certificates directly upon event completion and admin approval.',
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400',
    },
    {
      icon: Layers,
      title: 'Event Archiving',
      description: 'Review highlights, gallery photos, and recording drives from past events to continue your self-learning journey.',
      color: 'from-pink-500/20 to-rose-500/10 text-pink-400',
    },
  ];

  // Helper to render Registration Open cards (Phase 9)
  const renderRegistrationOpenCard = (event: Event) => {
    return (
      <div 
        key={event.id}
        className="group flex flex-col rounded-2xl border border-slate-900 bg-slate-950/60 overflow-hidden hover:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5 text-xs text-left"
      >
        {/* Cover Artwork */}
        <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
          {event.cardImage ? (
            <img 
              src={event.cardImage} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-700 font-bold">No Artwork</span>
            </div>
          )}
          
          {/* Mode Badge */}
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold text-slate-300 border border-slate-850">
            {event.mode === 'online' ? <Monitor className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
            <span className="capitalize">{event.mode}</span>
          </span>
        </div>

        {/* Info Area */}
        <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-violet-500">
              {event.category}
            </span>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
              {event.title}
            </h4>
            <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">
              {event.shortDescription}
            </p>
          </div>

          <div className="border-t border-slate-900/60 pt-3 space-y-3">
            <div className="flex flex-col gap-1 text-[10px] text-slate-450">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Host:</span>
                <span className="truncate">{event.speaker}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Date:</span>
                <span>{new Date(event.startDate!).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Venue:</span>
                <span className="truncate">{event.venue}</span>
              </div>
            </div>
            
            <Link
              to={`/event/${event.id}`}
              className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-violet-600 px-3.5 py-2 font-bold text-white hover:bg-violet-500 shadow-lg shadow-violet-450/10 transition-colors text-[10px]"
            >
              <span>Register Now</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render Running Event horizontal wide cards (Phase 10)
  const renderRunningEventCard = (event: Event) => {
    return (
      <div 
        key={event.id}
        className="group flex flex-col md:flex-row rounded-2xl border border-slate-900 bg-slate-950/60 overflow-hidden hover:border-slate-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/5 text-xs text-left"
      >
        {/* Wide Cover Image */}
        <div className="relative aspect-[16/9] md:w-52 bg-slate-900 overflow-hidden flex-shrink-0">
          {event.wideImage ? (
            <img 
              src={event.wideImage} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-955/20 to-slate-900 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-700 font-bold">No Cover</span>
            </div>
          )}
          
          {/* Live Pulsing Badge */}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider animate-pulse">
            <span className="h-1 w-1 rounded-full bg-white animate-ping" />
            LIVE
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500">
              {event.category}
            </span>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors leading-snug line-clamp-1">
              {event.title}
            </h4>
            <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">
              {event.shortDescription}
            </p>
            {event.announcement && (
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-2.5 py-1.5 flex items-start gap-1.5 mt-1.5 animate-pulse">
                <Megaphone className="h-3.5 w-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                <p className="text-[9px] text-slate-350 leading-relaxed font-semibold line-clamp-2">
                  Broadcast: {event.announcement}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-900/60 pt-3 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5 text-[10px] text-slate-450">
              <div>
                <span className="font-semibold text-slate-500">Host:</span> {event.speaker}
              </div>
              <div>
                <span className="font-semibold text-slate-500">Venue:</span> <span className="capitalize truncate max-w-24 inline-block align-bottom">{event.venue}</span>
              </div>
            </div>
            
            <Link
              to={`/event/${event.id}`}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-600 px-3.5 py-1.5 font-bold text-white hover:bg-rose-500 shadow-lg shadow-rose-600/10 transition-all duration-205 text-[10px]"
            >
              <span>View & Join</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render Past Event cards (Phase 12)
  const renderPastEventCard = (event: Event) => {
    return (
      <div 
        key={event.id}
        className="group flex flex-col rounded-2xl border border-slate-900 bg-slate-950/60 overflow-hidden hover:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 text-xs text-left"
      >
        {/* Banner Artwork */}
        <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
          {event.cardImage ? (
            <img 
              src={event.cardImage} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950/20 to-slate-900 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-700 font-bold">No Artwork</span>
            </div>
          )}
          
          {/* Attendees counter badge overlay */}
          {event.participantsCount !== undefined && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-650 px-2.5 py-1 text-[9px] font-bold text-white shadow-md border border-indigo-555">
              <Users className="h-3 w-3 text-indigo-200" />
              <span>{event.participantsCount} Attendees</span>
            </span>
          )}
        </div>

        {/* Info Area */}
        <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
              {event.category}
            </span>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
              {event.title}
            </h4>
            <p className="text-slate-505 text-[10px] leading-relaxed line-clamp-2">
              {event.shortDescription}
            </p>
          </div>

          <div className="border-t border-slate-900/60 pt-3 flex items-center justify-between gap-3 text-[10px] text-slate-450">
            <span>{new Date(event.startDate!).toLocaleDateString()}</span>
            
            <Link
              to={`/event/${event.id}`}
              className="inline-flex items-center gap-1 font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>View Archive</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render Coming Soon Sticky Notes (Phase 8)
  const renderComingSoonStickyNote = (event: Event, index: number) => {
    // Custom sticky note configurations
    const colors = [
      { bg: 'bg-yellow-500/5 hover:bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/40 text-yellow-250', shadow: 'shadow-yellow-500/5', tape: 'bg-yellow-500/10 border-yellow-500/10' },
      { bg: 'bg-pink-500/5 hover:bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40 text-pink-250', shadow: 'shadow-pink-500/5', tape: 'bg-pink-500/10 border-pink-500/10' },
      { bg: 'bg-sky-500/5 hover:bg-sky-500/10 border-sky-500/20 hover:border-sky-500/40 text-sky-250', shadow: 'shadow-sky-500/5', tape: 'bg-sky-500/10 border-sky-500/10' },
      { bg: 'bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40 text-purple-250', shadow: 'shadow-purple-500/5', tape: 'bg-purple-500/10 border-purple-500/10' },
    ];

    const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];
    
    const color = colors[index % colors.length];
    const rotation = rotations[index % rotations.length];

    return (
      <button
        key={event.id}
        onClick={() => setSelectedComingSoon(event)}
        className={`relative w-full aspect-square border rounded-md p-6 text-left flex flex-col justify-between transition-all duration-300 hover:scale-103 hover:-translate-y-1 shadow-md hover:shadow-lg cursor-pointer ${color.bg} ${color.shadow} ${rotation}`}
      >
        {/* Tape decoration at the top center */}
        <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-12 h-6 border backdrop-blur-xs rotate-1 opacity-70 pointer-events-none shadow-xs ${color.tape}`} />

        {/* Note header */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Coming Soon</span>
          </div>
          <h4 className="text-sm font-bold tracking-tight line-clamp-3 leading-snug">
            {event.title}
          </h4>
        </div>

        {/* Note footer */}
        <div className="border-t border-slate-900/10 pt-4 flex flex-col gap-1.5 text-[10px] opacity-80">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold">Speaker:</span>
            <span>{event.speaker}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">Event Date:</span>
            <span>{event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date TBD'}</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] bg-slate-950 overflow-hidden text-xs">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/10 h-72 w-72 rounded-full bg-violet-600/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/10 h-96 w-96 rounded-full bg-indigo-600/5 blur-3xl" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/5 px-3 py-1 text-xs text-violet-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>μLearn SBC Event Hub</span>
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Empowering Tech Talents Through{' '}
            <span className="bg-gradient-to-r from-violet-500 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Structured Events
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-xs text-slate-400 leading-relaxed">
            Plan, organize, track, and archive school and college events seamlessly. Build skills, earn points, and stay connected with the SBC community.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-600/15 hover:bg-violet-500 hover:shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              <span>Go to Admin Dashboard</span>
            </Link>
            <a
              href="#active-sections"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-3 font-semibold text-slate-350 hover:bg-slate-900 hover:text-white transition-all duration-200"
            >
              <span>Explore Live Events</span>
              <ArrowRight className="h-4.5 w-4.5 text-slate-500" />
            </a>
          </div>
        </div>
      </section>

      {/* Feature Icons Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-t border-slate-900/60">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-slate-900 bg-slate-950 p-5 transition-all duration-300 hover:border-slate-850 hover:bg-slate-900/10"
              >
                <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-3 group-hover:scale-105 transition-transform duration-350`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-semibold text-slate-300">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Loading & Event Dynamic Sections */}
      <div id="active-sections" className="border-t border-slate-900/60 bg-slate-950/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-violet-500" />
              <span className="text-xs text-slate-500 tracking-wider">Syncing with Firestore...</span>
            </div>
          ) : (
            <>
              {/* 1. RUNNING EVENTS (LIVE) */}
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 border-b border-slate-900 pb-3">
                  <Eye className="h-5 w-5 text-rose-500" />
                  <h2 className="text-base font-bold text-slate-200">Running Events (LIVE)</h2>
                  <span className="rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold px-2 py-0.5 animate-pulse uppercase">Active</span>
                </div>
                {runningEvents.length > 0 ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {runningEvents.map(renderRunningEventCard)}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-900 bg-slate-950/20 py-10 text-center text-slate-600">
                    No sessions are currently running live.
                  </div>
                )}
              </section>

              {/* 2. REGISTRATION OPEN */}
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 border-b border-slate-900 pb-3">
                  <PlayCircle className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-base font-bold text-slate-200">Registration Open</h2>
                </div>
                {registrationOpenEvents.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {registrationOpenEvents.map(renderRegistrationOpenCard)}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-900 bg-slate-950/20 py-10 text-center text-slate-600">
                    No events are open for registration right now.
                  </div>
                )}
              </section>

              {/* 3. COMING SOON - Sticky Notes (Phase 8) */}
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 border-b border-slate-900 pb-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-200">Coming Soon</h2>
                </div>
                {comingSoonEvents.length > 0 ? (
                  <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pt-4">
                    {comingSoonEvents.map(renderComingSoonStickyNote)}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-900 bg-slate-950/20 py-10 text-center text-slate-600">
                    Check back later for announcements of upcoming events.
                  </div>
                )}
              </section>

              {/* 4. PAST EVENTS */}
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 border-b border-slate-900 pb-3">
                  <CheckCircle2 className="h-5 w-5 text-slate-400" />
                  <h2 className="text-base font-bold text-slate-200">Past Events</h2>
                </div>
                {pastEvents.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {pastEvents.map(renderPastEventCard)}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-900 bg-slate-950/20 py-10 text-center text-slate-600">
                    No past events have been published in the archive yet.
                  </div>
                )}
              </section>
            </>
          )}

        </div>
      </div>

      {/* Coming Soon Detailed Popup Modal (Phase 8) */}
      {selectedComingSoon && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2 text-amber-500">
                <Clock className="h-4.5 w-4.5" />
                <span className="font-bold tracking-wider uppercase text-[10px]">Upcoming Event Teaser</span>
              </div>
              <button
                onClick={() => setSelectedComingSoon(null)}
                className="rounded-lg p-1.5 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-violet-500">
                  {selectedComingSoon.category}
                </span>
                <h3 className="text-base font-bold text-slate-200 mt-1 leading-snug">
                  {selectedComingSoon.title}
                </h3>
              </div>

              {/* Speaker info */}
              <div className="flex items-center gap-2.5 bg-slate-950/40 border border-slate-905 p-3 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Speaker / Host</p>
                  <p className="text-slate-200 text-xs font-bold">{selectedComingSoon.speaker}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Teaser Description</span>
                <p className="text-slate-400 leading-relaxed text-xs">
                  {selectedComingSoon.description}
                </p>
              </div>

              {/* Date cards */}
              <div className="grid gap-3.5 sm:grid-cols-2 pt-2 border-t border-slate-850">
                
                <div className="rounded-xl border border-slate-850 bg-slate-950 p-3.5 flex items-start gap-3">
                  <Calendar className="h-4.5 w-4.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Event Schedule</p>
                    <p className="text-slate-200 text-[11px] font-bold mt-0.5">
                      {selectedComingSoon.startDate ? new Date(selectedComingSoon.startDate).toLocaleDateString() : 'Date TBD'}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      {selectedComingSoon.startDate ? new Date(selectedComingSoon.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-850 bg-slate-950 p-3.5 flex items-start gap-3">
                  <Lock className="h-4.5 w-4.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">Registration Opens</p>
                    <p className="text-slate-200 text-[11px] font-bold mt-0.5">
                      {selectedComingSoon.registrationOpenDate 
                        ? new Date(selectedComingSoon.registrationOpenDate).toLocaleDateString()
                        : 'To be announced'}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Stay tuned!</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-850 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedComingSoon(null)}
                className="rounded-xl bg-violet-600 px-5 py-2.5 font-bold text-white hover:bg-violet-500 shadow-lg shadow-violet-600/10 hover:shadow-violet-500/20"
              >
                Close Teaser
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
