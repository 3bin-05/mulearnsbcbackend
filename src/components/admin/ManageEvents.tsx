import React, { useState } from 'react';
import { deleteEvent, updateEvent } from '../../services/firestore';
import type { Event, EventStatus } from '../../types/event';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  Monitor, 
  MapPin, 
  X, 
  Users,
  Award,
  Link,
  Info
} from 'lucide-react';

interface ManageEventsProps {
  events: Event[];
  onEdit: (event: Event) => void;
}

export const ManageEvents: React.FC<ManageEventsProps> = ({ events, onEdit }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Details Modal State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const categories = Array.from(new Set(events.map(e => e.category)));

  // Filter events client-side based on toolbar state
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.speaker.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the event "${title}"? This action is irreversible.`)) {
      try {
        await deleteEvent(id);
      } catch (err: any) {
        console.error(err);
        alert(`Failed to delete event: ${err?.message || err}`);
      }
    }
  };

  const handleMakeLive = async (event: Event) => {
    if (window.confirm(`Are you sure you want to transition "${event.title}" to Running? This will open registration immediately.`)) {
      try {
        const nowStr = new Date().toISOString();
        await updateEvent(event.id, {
          registrationOpenDate: nowStr,
          startDate: nowStr,
          registrationCloseDate: event.endDate, // Keep close date aligned with event end so registration remains open
        });
      } catch (err: any) {
        console.error(err);
        alert(`Failed to make event live: ${err?.message || err}`);
      }
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'coming-soon':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'registration-open':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'running':
        return 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse';
      case 'needs-finalization':
        return 'bg-cyan-50 text-cyan-600 border border-cyan-100';
      case 'past':
        return 'bg-slate-50 text-slate-500 border border-slate-100';
      default:
        return 'bg-slate-50 text-slate-500 border border-slate-100';
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs relative text-slate-800">
      
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-[#eef0f6] shadow-sm">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title or speaker..."
            className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-[#fcfbfe] px-3 py-2.5 text-slate-600 focus:border-[#6320ee] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="coming-soon">Coming Soon</option>
              <option value="registration-open">Registration Open</option>
              <option value="running">Running Live</option>
              <option value="needs-finalization">Needs Finalization</option>
              <option value="past">Past Events</option>
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-[#fcfbfe] px-3 py-2.5 text-slate-600 focus:border-[#6320ee] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="rounded-2xl border border-[#eef0f6] bg-white overflow-hidden shadow-sm">
        {filteredEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#eef0f6] text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-[#fcfbfe]">
                  <th className="px-6 py-4">Event Details</th>
                  <th className="px-6 py-4">Speaker</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7f5fd]/80">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="group hover:bg-[#fcfbfe] transition-colors">
                    
                    {/* Title & Metadata */}
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800 group-hover:text-slate-900 text-[12px] truncate" title={event.title}>
                          {event.title}
                        </span>
                        <div className="flex items-center gap-3 text-slate-450 text-[10px]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            {event.mode === 'online' ? <Monitor className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                            <span className="capitalize">{event.mode}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Speaker */}
                    <td className="px-6 py-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {event.speaker}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-slate-400" />
                        {event.category}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wide border ${getStatusBadge(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {event.status === 'coming-soon' && (
                          <button
                            onClick={() => handleMakeLive(event)}
                            className="rounded-xl px-3 py-1.5 border border-[#e2d9f7] bg-[#f1e9ff] text-[#6320ee] hover:text-white hover:bg-[#6320ee] cursor-pointer transition-colors text-[10px] font-bold"
                            title="Make Live (Running)"
                          >
                            Make Live
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="rounded-lg p-1.5 border border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-800 hover:border-slate-350 cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(event)}
                          className="rounded-lg p-1.5 border border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-800 hover:border-slate-355 cursor-pointer transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          className="rounded-lg p-1.5 border border-[#ffd1d1] bg-[#fff5f5] text-rose-500 hover:bg-[#ffeaea] cursor-pointer transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 italic">
            No events found.
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#eef0f6] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col text-slate-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#eef0f6] px-6 py-4">
              <div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase border tracking-wide ${getStatusBadge(selectedEvent.status)}`}>
                  {getStatusLabel(selectedEvent.status)}
                </span>
                <h2 className="text-base font-bold text-slate-850 mt-1">{selectedEvent.title}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1.5 border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Graphic Banner */}
              {selectedEvent.wideImage && (
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                  <img src={selectedEvent.wideImage} alt="Event wide cover" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Grid Metadata details */}
              <div className="grid gap-4 sm:grid-cols-2 text-slate-600">
                <div className="flex items-start gap-2">
                  <User className="h-4.5 w-4.5 text-slate-450 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-500 text-[10px] uppercase">Speaker</p>
                    <p className="text-slate-850 text-xs font-bold">{selectedEvent.speaker}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Tag className="h-4.5 w-4.5 text-slate-450 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-500 text-[10px] uppercase">Category</p>
                    <p className="text-slate-850 text-xs font-bold">{selectedEvent.category}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  {selectedEvent.mode === 'online' ? <Monitor className="h-4.5 w-4.5 text-slate-450 mt-0.5" /> : <MapPin className="h-4.5 w-4.5 text-slate-450 mt-0.5" />}
                  <div>
                    <p className="font-semibold text-slate-500 text-[10px] uppercase">Venue & Mode</p>
                    <p className="text-slate-850 text-xs font-bold capitalize">{selectedEvent.mode} ({selectedEvent.venue})</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4.5 w-4.5 text-slate-450 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-500 text-[10px] uppercase">Duration</p>
                    <p className="text-slate-855 text-xs font-bold">
                      {selectedEvent.startDate ? new Date(selectedEvent.startDate!).toLocaleString() : 'TBD'} - <br />
                      {selectedEvent.endDate ? new Date(selectedEvent.endDate!).toLocaleString() : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 border-t border-[#eef0f6] pt-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-[#6320ee]" />
                  <span>Description</span>
                </h3>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Registration & limits */}
              <div className="grid gap-4 sm:grid-cols-2 border-t border-[#eef0f6] pt-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-[#6320ee]" />
                  <span>Max Participants: <b>{selectedEvent.maxParticipants || 'Unlimited'}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-[#6320ee]" />
                  <span>Certificates: <b>{selectedEvent.certificateAvailable ? 'Yes' : 'No'}</b></span>
                </div>
                {selectedEvent.registrationLink && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Link className="h-4.5 w-4.5 text-cyan-500" />
                    <span>Reg Link: <a href={selectedEvent.registrationLink} target="_blank" rel="noreferrer" className="text-[#6320ee] hover:underline font-semibold">{selectedEvent.registrationLink}</a></span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#eef0f6] px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageEvents;
