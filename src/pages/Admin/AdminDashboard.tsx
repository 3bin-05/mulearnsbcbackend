import React, { useEffect, useState } from 'react';
import {
  FolderArchive,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PlayCircle,
  PlusCircle,
  Settings2,
  Shield,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToEvents } from '../../services/firestore';
import type { Event } from '../../types/event';
import CreateEvent from '../../components/admin/CreateEvent';
import DashboardOverview from '../../components/admin/DashboardOverview';
import ManageEvents from '../../components/admin/ManageEvents';
import NeedsFinalization from '../../components/admin/NeedsFinalization';
import PastEvents from '../../components/admin/PastEvents';
import RunningEvents from '../../components/admin/RunningEvents';


export const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
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
    <div className="sbc-shell min-h-screen flex flex-col md:flex-row text-[#1f2433] font-sans">

      <aside className="sbc-sidebar relative z-10 hidden md:flex md:w-72 flex-col border-r border-[#ece3fa] p-7 space-y-8 flex-shrink-0">
        <div className="flex flex-col gap-1.5 pb-2">
          <div className="flex items-center gap-3">
            {/* μLearn logo image */}
            <img src="/sbc.png" alt="μLearn Logo" className="h-7 w-auto object-contain" />
            {/* Vertical divider */}
            <span className="h-8 w-px bg-[#d4baff]" />
            {/* SBC text block */}
            <div className="flex flex-col leading-tight">
              <span className="text-base font-black tracking-tight text-[#1f2433] uppercase">
                SBC
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                Campus Chapter
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

        {/* Logout button */}
        <div className="pt-4 border-t border-[#ece3fa]">
          {user && (
            <div className="flex items-center gap-3 px-2 mb-3">
              <img
                src={user.photoURL || ''}
                alt={user.displayName || 'User'}
                className="h-8 w-8 rounded-full border border-[#d4baff] object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1f2433] truncate">{user.displayName}</span>
                <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-300 border border-transparent hover:border-red-100"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      <div className="relative z-20 flex md:hidden items-center justify-between border-b border-[#ece3fa] bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <img src="/sbc.png" alt="μLearn Logo" className="h-6 w-auto object-contain" />
          <span className="h-6 w-px bg-[#d4baff]" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-black tracking-tight text-[#1f2433] uppercase">SBC</span>
            <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-400">Campus Chapter</span>
          </div>
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
          {/* Mobile logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-all duration-200 outline-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
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
