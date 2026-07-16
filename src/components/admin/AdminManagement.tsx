import React, { useCallback, useEffect, useState } from 'react';
import {
  Clock,
  Crown,
  Loader2,
  LogIn,
  Mail,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  addAdmin,
  findUserByEmail,
  getAdmins,
  getLoginHistory,
  removeAdmin,
  type AdminUser,
  type LoginHistoryEntry,
} from '../../services/firestore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function Avatar({
  src,
  name,
  size = 36,
}: {
  src?: string;
  name: string;
  size?: number;
}) {
  const [err, setErr] = useState(false);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        style={{ width: size, height: size }}
        className="rounded-full object-cover border border-[#e9e1f8] flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-[#eadbff] text-[#6b2ff2] font-bold flex items-center justify-center flex-shrink-0 border border-[#d4baff]"
    >
      {initials || '?'}
    </div>
  );
}

// ─── Admin Management Tab ─────────────────────────────────────────────────────

const AdminManagement: React.FC = () => {
  const { user } = useAuth();

  // ── State ──
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activePanel, setActivePanel] = useState<'admins' | 'history'>('admins');

  // Add admin form
  const [addEmail, setAddEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Revoke loading per uid
  const [revokeLoading, setRevokeLoading] = useState<Record<string, boolean>>({});

  // History search
  const [historySearch, setHistorySearch] = useState('');

  // ── Data fetching ──
  const fetchAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await getLoginHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch login history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    fetchHistory();
  }, [fetchAdmins, fetchHistory]);

  // ── Add Admin ──
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = addEmail.trim().toLowerCase();
    if (!email) return;

    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);

    try {
      // Check if already an admin
      const existing = admins.find((a) => a.email.toLowerCase() === email);
      if (existing) {
        setAddError(`${email} is already an admin.`);
        return;
      }

      // Look up user from login history
      const found = await findUserByEmail(email);
      if (!found) {
        setAddError(
          `No user found with email "${email}". They must sign in at least once before being granted admin access.`,
        );
        return;
      }

      await addAdmin(found.uid, email, found.displayName, found.photoURL, user?.uid ?? '');
      setAddSuccess(`✓ ${found.displayName || email} has been granted admin access.`);
      setAddEmail('');
      await fetchAdmins();
    } catch (err: any) {
      setAddError(err?.message || 'Failed to add admin.');
    } finally {
      setAddLoading(false);
    }
  };

  // ── Revoke Admin ──
  const handleRevoke = async (admin: AdminUser) => {
    if (admin.uid === user?.uid) {
      alert("You can't revoke your own admin access.");
      return;
    }
    if (!window.confirm(`Remove admin access for ${admin.displayName || admin.email}?`)) return;

    setRevokeLoading((prev) => ({ ...prev, [admin.uid]: true }));
    try {
      await removeAdmin(admin.uid);
      setAdmins((prev) => prev.filter((a) => a.uid !== admin.uid));
    } catch (err: any) {
      alert(err?.message || 'Failed to revoke admin.');
    } finally {
      setRevokeLoading((prev) => ({ ...prev, [admin.uid]: false }));
    }
  };

  // ── Filtered history ──
  const filteredHistory = historySearch.trim()
    ? history.filter(
        (h) =>
          h.email.toLowerCase().includes(historySearch.toLowerCase()) ||
          h.displayName.toLowerCase().includes(historySearch.toLowerCase()),
      )
    : history;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-3 border-b border-[#e9e1f8]">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5 text-[#6b2ff2]" />
          <h2 className="text-base font-bold text-[#1f2433]">Admin Management</h2>
        </div>
        <p className="text-xs text-slate-500">
          Manage who has admin access to the SBC Admin Console and audit sign-in history.
        </p>
      </div>

      {/* Panel toggle tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActivePanel('admins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activePanel === 'admins'
              ? 'bg-[#eadbff] text-[#6b2ff2]'
              : 'text-slate-500 hover:bg-[#f4edff] hover:text-[#6b2ff2] border border-[#e9e1f8]'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Admin Users
          {!loadingAdmins && (
            <span className="ml-0.5 bg-[#6b2ff2]/10 text-[#6b2ff2] rounded-full px-1.5 py-0.5 text-[10px] font-bold">
              {admins.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActivePanel('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activePanel === 'history'
              ? 'bg-[#eadbff] text-[#6b2ff2]'
              : 'text-slate-500 hover:bg-[#f4edff] hover:text-[#6b2ff2] border border-[#e9e1f8]'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Login History
          {!loadingHistory && (
            <span className="ml-0.5 bg-[#6b2ff2]/10 text-[#6b2ff2] rounded-full px-1.5 py-0.5 text-[10px] font-bold">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* ── ADMINS PANEL ── */}
      {activePanel === 'admins' && (
        <div className="space-y-5">
          {/* Add Admin Form */}
          <div className="sbc-panel p-5 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-[#6b2ff2]" />
              <h3 className="text-sm font-bold text-[#1f2433]">Grant Admin Access</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter the Google email of the person you want to grant admin access. They must have
              signed in at least once (they'll see the Access Denied page) before you can add them.
            </p>

            <form onSubmit={handleAddAdmin} className="flex gap-2 items-stretch">
              <div className="flex-grow relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => {
                    setAddEmail(e.target.value);
                    setAddError(null);
                    setAddSuccess(null);
                  }}
                  placeholder="admin@example.com"
                  className="sbc-input pl-9 text-sm"
                  disabled={addLoading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={addLoading || !addEmail.trim()}
                className="sbc-button-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                <span>Add Admin</span>
              </button>
            </form>

            {addError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-xs text-green-700">
                {addSuccess}
              </div>
            )}
          </div>

          {/* Admin List */}
          <div className="sbc-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-[#6b2ff2]" />
                <h3 className="text-sm font-bold text-[#1f2433]">Current Admins</h3>
              </div>
              <button
                onClick={fetchAdmins}
                className="text-[10px] text-[#6b2ff2] hover:underline font-semibold"
              >
                Refresh
              </button>
            </div>

            {loadingAdmins ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 text-[#6b2ff2] animate-spin" />
              </div>
            ) : admins.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d4baff] py-8 text-center text-xs text-slate-500">
                No admins found.
              </div>
            ) : (
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div
                    key={admin.uid}
                    className="flex items-center gap-3 rounded-2xl border border-[#e9e1f8] bg-white/70 px-4 py-3 hover:border-[#d4baff] transition-colors"
                  >
                    <Avatar src={admin.photoURL} name={admin.displayName || admin.email} />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-[#1f2433] truncate">
                          {admin.displayName || '—'}
                        </span>
                        {admin.uid === user?.uid && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-[#6b2ff2] bg-[#eadbff] px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                          Admin
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{admin.email}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Added {formatDate(admin.addedAt)}
                      </span>
                    </div>
                    {admin.uid !== user?.uid && (
                      <button
                        onClick={() => handleRevoke(admin)}
                        disabled={revokeLoading[admin.uid]}
                        title="Revoke admin access"
                        className="flex-shrink-0 flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 text-[10px] font-bold text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {revokeLoading[admin.uid] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldOff className="h-3 w-3" />
                        )}
                        Revoke
                      </button>
                    )}
                    {admin.uid === user?.uid && (
                      <span className="flex-shrink-0 text-[10px] text-slate-400 italic pr-1">
                        (current)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LOGIN HISTORY PANEL ── */}
      {activePanel === 'history' && (
        <div className="sbc-panel p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4 text-[#6b2ff2]" />
              <h3 className="text-sm font-bold text-[#1f2433]">Sign-in History</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by name or email…"
                className="sbc-input pl-8 text-xs py-2 w-56"
              />
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 text-[#6b2ff2] animate-spin" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#d4baff] py-10 text-center text-xs text-slate-500">
              {historySearch ? 'No results for your search.' : 'No sign-in records yet.'}
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-[#e9e1f8]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e9e1f8] bg-[#fbf9ff]">
                    <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                      User
                    </th>
                    <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                      Email
                    </th>
                    <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                      Signed In At
                    </th>
                    <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eafa]">
                  {filteredHistory.map((entry) => {
                    const isAdmin = admins.some((a) => a.uid === entry.uid);
                    return (
                      <tr
                        key={entry.id}
                        className="bg-white/60 hover:bg-[#faf7ff] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={entry.photoURL}
                              name={entry.displayName || entry.email}
                              size={28}
                            />
                            <span className="font-semibold text-[#1f2433] truncate max-w-[130px]">
                              {entry.displayName || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 truncate max-w-[180px]">
                          {entry.email}
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {formatDate(entry.signedInAt)}
                        </td>
                        <td className="px-4 py-3">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#eadbff] text-[#6b2ff2] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                              <Trash2 className="h-2.5 w-2.5" />
                              No Access
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-right">
            {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}
            {historySearch && ` matching "${historySearch}"`}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
