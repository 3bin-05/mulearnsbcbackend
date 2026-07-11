import type { Event } from '../../types/event';
import { Calendar, Clock, PlayCircle, Eye, Settings, CheckCircle2, Monitor, MapPin } from 'lucide-react';

interface DashboardOverviewProps {
  events: Event[];
  onNavigateToTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ events, onNavigateToTab }) => {
  // Compute counts dynamically
  const getCountByStatus = (status: string) => events.filter(e => e.status === status).length;
  
  const needsFinalizationCount = events.filter((e) => {
    const end = e.endDate ? new Date(e.endDate) : null;
    const now = new Date();
    const isConcluded = end && now >= end;
    const hasDetails = (e.highlights && e.highlights.length > 0) || 
                       e.recordingLink || 
                       e.driveLink || 
                       (e.gallery && e.gallery.length > 0);
    return isConcluded && !hasDetails;
  }).length;

  const stats = [
    { id: 'all', name: 'Total Events', value: events.length, icon: Calendar, color: 'text-[#6320ee] bg-[#f1e9ff]/50 border-[#f0ecfc] hover:border-[#dedcf3]', tabName: 'manage' },
    { id: 'coming-soon', name: 'Coming Soon', value: getCountByStatus('coming-soon'), icon: Clock, color: 'text-amber-600 bg-amber-50/50 border-amber-100 hover:border-amber-200', tabName: 'manage' },
    { id: 'registration-open', name: 'Registration Open', value: getCountByStatus('registration-open'), icon: PlayCircle, color: 'text-emerald-600 bg-emerald-50/50 border-emerald-100 hover:border-emerald-200', tabName: 'manage' },
    { id: 'running', name: 'Running Live', value: getCountByStatus('running'), icon: Eye, color: 'text-rose-600 bg-rose-50/50 border-rose-100 hover:border-rose-200', tabName: 'running' },
    { id: 'needs-finalization', name: 'Needs Finalization', value: needsFinalizationCount, icon: Settings, color: 'text-cyan-600 bg-cyan-50/50 border-cyan-100 hover:border-cyan-200', tabName: 'finalization' },
    { id: 'past', name: 'Past Events', value: getCountByStatus('past'), icon: CheckCircle2, color: 'text-slate-500 bg-slate-50/50 border-slate-100 hover:border-slate-200', tabName: 'past' },
  ];

  // Get active (running or registration open) events for a quick summary
  const activeEvents = events.filter(e => e.status === 'running' || e.status === 'registration-open');

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Overview stats cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.id}
              onClick={() => onNavigateToTab(stat.tabName)}
              className={`text-left rounded-2xl border bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${stat.color} cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl p-2 bg-white/80">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-850">{stat.value}</span>
              </div>
              <p className="mt-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                {stat.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active events panel */}
      <div className="rounded-2xl border border-[#eef0f6] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#eef0f6] pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Active Opportunities</h2>
            <p className="text-xs text-slate-500 mt-1">Currently running or open for registration.</p>
          </div>
          <button
            onClick={() => onNavigateToTab('manage')}
            className="text-xs font-bold text-[#6320ee] hover:text-[#5219de] transition-colors cursor-pointer"
          >
            Manage all events
          </button>
        </div>

        {activeEvents.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#eef0f6] text-slate-400 font-semibold">
                  <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Event Title</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Speaker</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Category</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Mode</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7f5fd]/80">
                {activeEvents.map((event) => (
                  <tr key={event.id} className="group hover:bg-[#fcfbfe] transition-colors">
                    <td className="py-3.5 font-semibold text-slate-700 group-hover:text-slate-900">
                      {event.title}
                    </td>
                    <td className="py-3.5 text-slate-500">{event.speaker || '-'}</td>
                    <td className="py-3.5 text-slate-500">
                      <div className="flex flex-col">
                        <span>{event.category}</span>
                        <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wide">
                          {event.eventType || 'workshop'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        {event.mode === 'online' ? <Monitor className="h-3.5 w-3.5 text-[#6320ee]" /> : <MapPin className="h-3.5 w-3.5 text-cyan-500" />}
                        <span className="capitalize">{event.mode}</span>
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${
                        event.status === 'running'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {event.status === 'running' ? 'Live' : 'Reg Open'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs italic">
            No active events at this time.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
