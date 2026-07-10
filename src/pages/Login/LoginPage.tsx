import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      {/* ───── LEFT PANEL ───── */}
      <div className="lp-left">
        {/* Top brand */}
        <div className="lp-left-brand">
          <div className="lp-brand-logo">
            <LightningIcon size={18} color="#7c3aed" />
          </div>
          <div>
            <div className="lp-brand-title">
              <span className="lp-brand-mu">μLearm</span>
              <span className="lp-brand-sbc"> SBC</span>
            </div>
            <div className="lp-brand-sub">EVENT HUB DASHBOARD</div>
          </div>
        </div>

        {/* Headline */}
        <div className="lp-left-hero">
          <h1 className="lp-hero-admin">Admin</h1>
          <h1 className="lp-hero-access">Access</h1>
          <div className="lp-hero-divider" />
          <p className="lp-hero-desc">
            Sign up to access the μLearn SBC Admin Console and manage events with ease.
          </p>
        </div>

        {/* Illustration */}
        <div className="lp-illustration-wrap">
          <img
            src="/login-illustration.png"
            alt="Admin dashboard illustration"
            className="lp-illustration"
          />
        </div>

        {/* Decorative sparkles */}
        <span className="lp-sparkle lp-sparkle-1">✦</span>
        <span className="lp-sparkle lp-sparkle-2">✦</span>
        <span className="lp-sparkle lp-sparkle-3">+</span>
        <span className="lp-sparkle lp-sparkle-4">+</span>
      </div>

      {/* ───── RIGHT PANEL ───── */}
      <div className="lp-right">
        {/* Shield icon top-right */}
        <div className="lp-shield-deco" aria-hidden="true">
          <ShieldIcon />
          <span className="lp-sparkle lp-rsparkle-1">✦</span>
          <span className="lp-sparkle lp-rsparkle-2">+</span>
        </div>

        <div className="lp-form-card animate-fade-in">
          {/* Logo */}
          <div className="lp-form-logo-wrap">
            <div className="lp-form-logo">
              <LightningIcon size={26} color="#7c3aed" />
            </div>
          </div>

          {/* Brand */}
          <div className="lp-form-brand">
            <span className="lp-form-brand-mu">μLearm</span>
            <span className="lp-form-brand-sbc"> SBC</span>
          </div>
          <div className="lp-form-brand-sub">EVENT HUB DASHBOARD</div>

          {/* Heading */}
          <h2 className="lp-form-title">Create Admin Account</h2>
          <p className="lp-form-subtitle">
            Secure access to manage and oversee all μLearn SBC events.
          </p>

          {/* Divider with icon */}
          <div className="lp-form-divider">
            <span className="lp-form-divider-line" />
            <span className="lp-form-divider-icon">
              <LightningIcon size={14} color="#7c3aed" />
            </span>
            <span className="lp-form-divider-line" />
          </div>

          {/* Google Sign-in */}
          <button
            id="google-signin-btn"
            className="lp-google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            aria-label="Sign up with Google"
          >
            {loading ? (
              <span className="lp-spinner" aria-hidden="true" />
            ) : (
              <GoogleIcon />
            )}
            <span>{loading ? 'Signing in…' : 'Sign up with Google'}</span>
          </button>

          {/* Error */}
          {error && (
            <div className="lp-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6.3" stroke="#dc2626" strokeWidth="1.4" />
                <path d="M7 4v3.2" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="9.8" r="0.75" fill="#dc2626" />
              </svg>
              {error}
            </div>
          )}

          {/* Footer note */}
          <div className="lp-form-note">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="6.75" stroke="#7c3aed" strokeWidth="1.3" />
              <path d="M5 7.5l2 2 3-3" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>
              Only authorized admins can access <strong>the admin console.</strong>
            </span>
          </div>

          {/* Bottom dashed decoration */}
          <span className="lp-sparkle lp-bsparkle-1">✦</span>
        </div>
      </div>
    </div>
  );
}

/* ── Inline SVG icons ── */
function LightningIcon({ size = 20, color = '#7c3aed' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13 2L4.5 13.5H11L9 22L19.5 10.5H13L13 2Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.31z" fill="#4285F4" />
      <path d="M10 20c2.7 0 4.96-.9 6.62-2.44l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H1.08v2.58A9.99 9.99 0 0010 20z" fill="#34A853" />
      <path d="M4.4 11.9A6 6 0 014.16 10c0-.66.12-1.3.24-1.9V5.52H1.08A9.99 9.99 0 000 10c0 1.6.38 3.12 1.08 4.48l3.32-2.58z" fill="#FBBC05" />
      <path d="M10 3.98c1.46 0 2.78.5 3.82 1.5l2.86-2.86A9.94 9.94 0 0010 0 9.99 9.99 0 001.08 5.52l3.32 2.58C5.2 5.74 7.4 3.98 10 3.98z" fill="#EA4335" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="52" height="60" viewBox="0 0 52 60" fill="none" aria-hidden="true">
      <path
        d="M26 2L4 12v16c0 14.5 9.5 28 22 32 12.5-4 22-17.5 22-32V12L26 2z"
        stroke="#c4b5fd"
        strokeWidth="1.8"
        fill="rgba(196,181,253,0.08)"
        strokeLinejoin="round"
      />
      <rect x="18" y="23" width="16" height="14" rx="2" stroke="#a78bfa" strokeWidth="1.5" fill="none" />
      <circle cx="26" cy="30" r="2.5" fill="#a78bfa" />
      <path d="M26 32v3" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
