import { useAuth } from '../../context/AuthContext';

export default function AccessDeniedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="access-denied-root">
      {/* Background orbs */}
      <div className="access-orb access-orb-1" />
      <div className="access-orb access-orb-2" />

      <div className="access-card animate-fade-in">
        {/* Icon */}
        <div className="access-icon-wrap">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path
              d="M18 3L3 11v9c0 9.15 6.45 17.7 15 19.8 8.55-2.1 15-10.65 15-19.8V11L18 3z"
              fill="rgba(124,58,237,0.12)"
              stroke="#7c3aed"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M13 18l3.5 3.5 6.5-7" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
            <path d="M18 14v5" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="21.5" r="1.2" fill="#dc2626" />
          </svg>
        </div>

        {/* Text */}
        <h1 className="access-title">Access Denied</h1>
        <p className="access-subtitle">
          Your account (<strong>{user?.email}</strong>) does not have admin privileges.
        </p>
        <p className="access-desc">
          Only authorized administrators can access the μLearn SBC dashboard.
          Contact your system administrator to request access.
        </p>

        {/* Actions */}
        <button
          onClick={logout}
          className="access-btn"
          id="access-denied-logout-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out &amp; try a different account
        </button>
      </div>
    </div>
  );
}
