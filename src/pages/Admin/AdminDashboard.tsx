import React, { useEffect, useState } from 'react';
import {
  FolderArchive,
  Layers,
  LayoutDashboard,
  Menu,
  PlayCircle,
  PlusCircle,
  Settings2,
  Shield,
  X,
} from 'lucide-react';
import { subscribeToEvents } from '../../services/firestore';
import type { Event } from '../../types/event';
import CreateEvent from '../../components/admin/CreateEvent';
import DashboardOverview from '../../components/admin/DashboardOverview';
import ManageEvents from '../../components/admin/ManageEvents';
import NeedsFinalization from '../../components/admin/NeedsFinalization';
import PastEvents from '../../components/admin/PastEvents';
import RunningEvents from '../../components/admin/RunningEvents';

const PlantIllustration: React.FC = () => (
  <div className="mt-auto pt-8 select-none pointer-events-none opacity-75">
    <svg viewBox="0 0 230 210" className="w-48 h-auto mx-auto" fill="none" stroke="#9b7bd7" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
      <path d="M42 158 h128 v13 h-128 z" fill="#fbf9ff" />
      <path d="M50 145 h112 v13 h-112 z" fill="#fbf9ff" />
      <path d="M58 132 h96 v13 h-96 z" fill="#fbf9ff" />
      <path d="M68 118 h74 v14 h-74 z" fill="#fbf9ff" />
      <path d="M28 178 c45 9 115 9 166 0" />
      <path d="M86 132 l5 -26 h24 l5 26 z" fill="#fbf9ff" />
      <path d="M103 106 c-2 -22 -18 -32 -18 -32" />
      <path d="M103 106 c8 -20 23 -30 23 -30" />
      <path d="M103 106 c-1 -27 7 -43 7 -43" />
      <path d="M93 89 c-6 -3 -8 -10 -5 -16 c4 2 7 8 5 16" fill="#f2eaff" />
      <path d="M112 94 c6 -2 10 -8 11 -15 c-4 2 -9 7 -11 15" fill="#f2eaff" />
      <path d="M107 72 c1 -7 7 -12 11 -13 c-4 4 -7 9 -11 13" fill="#f2eaff" />
      <path d="M99 76 c-4 -5 -5 -11 -2 -16 c2 4 4 9 2 16" fill="#f2eaff" />
      <path d="M70 65 l2.5 2.5 l-2.5 2.5 l-2.5 -2.5 z" fill="#9b7bd7" stroke="none" />
      <path d="M138 74 l2.5 2.5 l-2.5 2.5 l-2.5 -2.5 z" fill="#9b7bd7" stroke="none" />
      <path d="M167 104 l2 2 l-2 2 l-2 -2 z" fill="#9b7bd7" stroke="none" />
    </svg>
  </div>
);

const FloatingArchiveArt: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block" aria-hidden="true">
    <svg viewBox="0 0 760 520" className="absolute right-0 top-24 h-[520px] w-[760px] opacity-70" fill="none" stroke="#9b7bd7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M325 76 c72 -58 144 30 212 -24 c22 -17 16 -48 -6 -44 c-25 5 -25 52 19 55 c31 2 52 -8 78 -32" strokeDasharray="4 7" />
      <path d="M639 19 l39 -21 l-15 42 z M639 19 l25 21 l14 -42" fill="#fbf9ff" />
      <path d="M300 80 l3 3 l-3 3 l-3 -3 z" fill="#9b7bd7" stroke="none" />
      <path d="M205 390 l3 3 l-3 3 l-3 -3 z" />
      <path d="M295 368 l4 4 l-4 4 l-4 -4 z" />
      <path d="M420 338 l3 3 l-3 3 l-3 -3 z" />
    </svg>
  </div>
);

const WorkspaceIllustration: React.FC = () => (
  <div className="pointer-events-none absolute bottom-0 right-0 hidden w-[58vw] max-w-4xl select-none opacity-75 lg:block" aria-hidden="true">
    <svg viewBox="0 0 720 300" className="h-auto w-full" fill="none" stroke="#8f6bc9" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 276 c145 24 412 20 710 0" />
      <path d="M96 205 h104 v20 h-104 z" fill="#fbf9ff" />
      <path d="M104 181 h90 v24 h-90 z" fill="#fbf9ff" />
      <path d="M112 160 h76 v21 h-76 z" fill="#fbf9ff" />
      <path d="M120 142 h62 v18 h-62 z" fill="#fbf9ff" />
      <text x="136" y="219" fontSize="11" fill="#6b2ff2" stroke="none" fontFamily="Inter, sans-serif">LEARN</text>
      <text x="137" y="198" fontSize="11" fill="#6b2ff2" stroke="none" fontFamily="Inter, sans-serif">BUILD</text>
      <text x="136" y="176" fontSize="11" fill="#6b2ff2" stroke="none" fontFamily="Inter, sans-serif">SHARE</text>
      <text x="132" y="155" fontSize="11" fill="#6b2ff2" stroke="none" fontFamily="Inter, sans-serif">IMPACT</text>
      <path d="M250 178 v60 h36 v-60 z" fill="#fbf9ff" />
      <path d="M256 178 l-10 -35 l5 -2 l10 37" />
      <path d="M270 178 l2 -42 h4 l-2 42" />
      <path d="M282 178 l16 -34 l4 3 l-15 31" />
      <path d="M398 214 l102 24 l76 -28 l-104 -24 z" fill="#fbf9ff" />
      <path d="M408 211 c5 -5 8 -2 4 4" />
      <path d="M424 215 c5 -5 8 -2 4 4" />
      <path d="M440 219 c5 -5 8 -2 4 4" />
      <path d="M500 228 l45 -24" />
      <path d="M363 206 l126 -15 l15 -104 l-128 16 z" fill="#fbf9ff" />
      <path d="M363 206 l126 -15 l26 18 l-126 16 z" fill="#fbf9ff" />
      <rect x="392" y="112" width="75" height="58" transform="rotate(-7 392 112)" strokeDasharray="2 4" />
      <path d="M606 195 a19 27 0 0 1 38 0 v35 a19 16 0 0 1 -38 0 z" fill="#fbf9ff" />
      <path d="M644 204 c15 0 24 8 24 20 s-9 20 -24 20" />
      <path d="M621 213 l13 -10 l-6 19 l12 -8" stroke="#6b2ff2" strokeWidth="2" />
      <path d="M260 82 l3 3 l-3 3 l-3 -3 z" />
      <path d="M372 62 l3 3 l-3 3 l-3 -3 z" />
      <path d="M170 92 l3 3 l-3 3 l-3 -3 z" />
    </svg>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToEvents((data) => {
      setEvents(data);
    });
    return () => unsubscribe();
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'create', name: 'Create Event', icon: PlusCircle },
    { id: 'manage', name: 'Manage Events', icon: Settings2 },
    { id: 'running', name: 'Running Events', icon: PlayCircle },
    { id: 'finalization', name: 'Needs Finalization', icon: Layers },
    { id: 'past', name: 'Past Events Manager', icon: FolderArchive },
  ];

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    if (tabId !== 'edit') {
      setEditingEvent(null);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <DashboardOverview events={events} onNavigateToTab={handleTabChange} />;
      case 'create':
        return <CreateEvent />;
      case 'edit':
        return (
          <CreateEvent
            editingEvent={editingEvent}
            onCancel={() => {
              setEditingEvent(null);
              setCurrentTab('manage');
            }}
          />
        );
      case 'manage':
        return (
          <ManageEvents
            events={events}
            onEdit={(event) => {
              setEditingEvent(event);
              setCurrentTab('edit');
            }}
          />
        );
      case 'running':
        return <RunningEvents events={events} />;
      case 'finalization':
        return <NeedsFinalization events={events} />;
      case 'past':
        return <PastEvents events={events} />;
      default:
        return <DashboardOverview events={events} onNavigateToTab={handleTabChange} />;
    }
  };

  const getActiveTabName = () => {
    if (currentTab === 'edit') return 'Edit Event';
    return tabs.find((t) => t.id === currentTab)?.name || 'Overview';
  };

  return (
    <div className="sbc-shell relative min-h-screen overflow-hidden flex flex-col md:flex-row text-[#1f2433] font-sans">
      <FloatingArchiveArt />
      <WorkspaceIllustration />

      <aside className="sbc-sidebar relative z-10 hidden md:flex md:w-72 flex-col border-r border-[#ece3fa] p-7 space-y-8 flex-shrink-0">
        <div className="flex flex-col gap-1.5 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#efe6fb]">
              <img src="/favicon.svg" alt="muLearn Logo" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#1f2433]">
                <span className="text-[#7a34ff]">muLearn</span> SBC
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Event Hub Dashboard
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-2 text-[#1f2433]">
          <Shield className="h-6 w-6 text-[#6b2ff2]" />
          <span className="font-extrabold tracking-tight text-base">
            SBC Admin Console
          </span>
        </div>

        <nav className="flex-grow space-y-3 text-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = currentTab === tab.id || (tab.id === 'manage' && currentTab === 'edit');
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#b990ff] ${
                  isSelected
                    ? 'bg-[#eadbff] text-[#6b2ff2] shadow-sm'
                    : 'text-slate-600 hover:bg-white/70 hover:text-[#1f2433] border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? 'text-[#6b2ff2]' : 'text-slate-500'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <PlantIllustration />
      </aside>

      <div className="relative z-20 flex md:hidden items-center justify-between border-b border-[#ece3fa] bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-[#efe6fb]">
            <img src="/favicon.svg" alt="muLearn Logo" className="h-5 w-5 object-contain" />
          </div>
          <span className="text-sm font-bold text-[#1f2433]">
            muLearn <span className="text-[#6b2ff2]">SBC</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-500 hover:bg-[#f4edff] hover:text-[#6b2ff2] border border-[#ece3fa]"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="relative z-20 md:hidden bg-white/95 border-b border-[#ece3fa] px-3 py-3.5 text-xs space-y-1 backdrop-blur">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = currentTab === tab.id || (tab.id === 'manage' && currentTab === 'edit');
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#b990ff] ${
                  isSelected
                    ? 'bg-[#eadbff] text-[#6b2ff2]'
                    : 'text-slate-600 hover:bg-[#f8f4ff] hover:text-[#1f2433]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <main className="relative z-10 flex-grow p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto overflow-y-auto flex flex-col w-full min-h-screen">
        <div className="hidden md:flex items-center justify-between w-full mb-12">
          <div className="text-xs font-semibold text-slate-400">
            Admin Console / <span className="text-[#6b2ff2]">{getActiveTabName()}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[#cdb6f8] bg-white/55 px-5 py-2.5 text-[12px] font-bold text-[#6b2ff2] uppercase tracking-wide shadow-sm backdrop-blur">
            <Shield className="h-4 w-4" />
            <span>Administrative Portal</span>
          </div>
        </div>

        <div className="flex-grow flex flex-col">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
