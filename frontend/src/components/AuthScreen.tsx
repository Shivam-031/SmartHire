import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from './BrandWordmark';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: (notification?: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

// Google OAuth 2.0 Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '228003091405-8p3lrjrfg1mo4nal0sru1417j95hqgef.apps.googleusercontent.com';

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetField, setTargetField] = useState('it');
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [gisRendered, setGisRendered] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Initialize official Google Identity Services & trigger native Chrome Account Chooser (One Tap)
  useEffect(() => {
    let active = true;

    const setupGoogleAuth = () => {
      if (!active) return false;
      if (!window.google?.accounts?.id || !googleBtnContainerRef.current) return false;

      try {
        try {
          window.google.accounts.id.cancel();
        } catch (_) {}

        // 1. Initialize Google Identity Services with real Google Client ID
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response?.credential) {
              setGoogleLoading(true);
              setError(null);
              setSuccessMsg('Google account verified! Entering workspace...');
              const res = await loginWithGoogle(response.credential, targetField, targetRole);
              setGoogleLoading(false);
              if (res.success) {
                onSuccess?.();
              } else {
                setSuccessMsg(null);
                setError(res.error || 'Google authentication failed.');
              }
            } else {
              setError('Google identity verification was cancelled or failed.');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false,
          itp_support: true,
        });

        // 2. Render Google's native button directly
        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 380,
          });
        }

        // 3. Immediately prompt Chrome to display native Google Account Chooser (One Tap / FedCM)
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log('Chrome One Tap status:', notification.getNotDisplayedReason());
          }
        });

        setGisRendered(true);
        return true;
      } catch (err: any) {
        console.warn('Google Identity Services setup warning:', err);
        return false;
      }
    };

    if (!setupGoogleAuth()) {
      const timer = setInterval(() => {
        if (setupGoogleAuth()) {
          clearInterval(timer);
        }
      }, 200);
      return () => {
        active = false;
        clearInterval(timer);
        try {
          window.google?.accounts?.id?.cancel();
        } catch (_) {}
      };
    }

    return () => {
      active = false;
      try {
        window.google?.accounts?.id?.cancel();
      } catch (_) {}
    };
  }, [mode, targetField, targetRole, loginWithGoogle, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signup') {
      const res = await signup(name, email, password, targetField, targetRole);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Account created successfully! Loading workspace...');
        onSuccess?.();
      } else {
        setError(res.error || 'Failed to create candidate account.');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Signed in successfully! Loading workspace...');
        onSuccess?.();
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 p-6 sm:p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm text-left animate-fadeIn space-y-6">
      <div className="text-center space-y-2">
        <BrandWordmark className="mx-auto" />
        <h1 className="text-2xl font-bold tracking-tight text-[#17181C]">
          {mode === 'login' ? 'Candidate Sign In' : 'Candidate Registration'}
        </h1>
        <p className="text-xs text-[#6B7078]">
          {mode === 'login'
            ? 'Sign in to access your interview telemetry, rubrics, and ATS audit.'
            : 'Select your Google account from Chrome to immediately calibrate your workspace.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-[#F1F2F4] p-1 rounded-xl border border-[#E5E7EB] text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
            mode === 'login' ? 'bg-white text-[#17181C] shadow-xs' : 'text-[#6B7078]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setError(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
            mode === 'signup' ? 'bg-white text-[#17181C] shadow-xs' : 'text-[#6B7078]'
          }`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B23A2E] text-xs font-mono flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-mono flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Career Track Calibration (When Signing Up) */}
      {mode === 'signup' && (
        <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#17181C]">
            <span className="material-symbols-outlined text-[15px] text-[#2E6FF2]">tune</span>
            <span>Career Track Calibration</span>
          </div>
          <p className="text-[11px] text-[#6B7078]">
            Choose your specialization track — your Google account profile will be pre-calibrated to this track:
          </p>

          <div className="space-y-2">
            <div>
              <label className="font-mono text-[10px] uppercase font-bold text-[#6B7078] block mb-1">
                Target Field
              </label>
              <select
                value={targetField}
                onChange={(e) => {
                  setTargetField(e.target.value);
                  if (e.target.value === 'management') setTargetRole('Product Manager');
                  else if (e.target.value === 'law') setTargetRole('Corporate Counsel');
                  else setTargetRole('Frontend Developer');
                }}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
              >
                <option value="it">Information Technology (Systems & Code)</option>
                <option value="management">Management & Business (Strategy & Operations)</option>
                <option value="law">Law & Legal (Governance & Compliance)</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase font-bold text-[#6B7078] block mb-1">
                Specialized Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Engineer"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Real Google Account Selection (Chrome One Tap & Official GIS Button) */}
      <div className="space-y-3">
        <div className="flex flex-col items-center justify-center">
          {!gisRendered && (
            <div className="w-full py-2.5 px-4 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center gap-3 text-xs text-[#6B7078] animate-pulse mb-2">
              <div className="w-4 h-4 border-2 border-[#6B7078] border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting to Google Identity Services...</span>
            </div>
          )}

          {/* Clean DOM node strictly managed by Google Identity Services */}
          <div
            ref={googleBtnContainerRef}
            className="w-full flex justify-center min-h-[44px]"
          />

          {googleLoading && (
            <div className="mt-2 text-xs text-[#2E6FF2] font-mono flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#2E6FF2] border-t-transparent rounded-full animate-spin"></div>
              <span>Reading your Google profile & signing in...</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#E5E7EB]"></div>
          <span className="shrink mx-3 text-[10px] font-mono uppercase text-[#9CA3AF] tracking-wider">
            or continue with password
          </span>
          <div className="flex-grow border-t border-[#E5E7EB]"></div>
        </div>
      </div>

      {/* Standard Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {mode === 'signup' && (
          <div>
            <label className="font-mono text-[11px] uppercase font-bold text-[#6B7078] block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
            />
          </div>
        )}

        <div>
          <label className="font-mono text-[11px] uppercase font-bold text-[#6B7078] block mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.rivera@example.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
          />
        </div>

        <div>
          <label className="font-mono text-[11px] uppercase font-bold text-[#6B7078] block mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#17181C] hover:bg-[#2A2B30] text-white rounded-xl font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>{mode === 'login' ? 'Sign In with Password' : 'Create Account with Password'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AuthScreen;
