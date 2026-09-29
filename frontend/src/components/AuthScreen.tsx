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

  useEffect(() => {
    let active = true;

    const setupGoogleAuth = () => {
      if (!active) return false;
      if (!window.google?.accounts?.id || !googleBtnContainerRef.current) return false;

      try {
        try {
          window.google.accounts.id.cancel();
        } catch (_) {}

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (!active) return;
            if (response && response.credential) {
              setGoogleLoading(true);
              setError(null);
              setSuccessMsg(null);
              const res = await loginWithGoogle(response.credential);
              setGoogleLoading(false);
              if (res.success) {
                setSuccessMsg('Google authentication verified. Entering workspace...');
                onSuccess?.();
              } else {
                setError(res.error || 'Google login failed. Please try again.');
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          const containerWidth = Math.min(
            380,
            googleBtnContainerRef.current.parentElement?.clientWidth || 340
          );
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            shape: 'pill',
            theme: 'filled_black',
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
            size: 'large',
            logo_alignment: 'left',
            width: containerWidth,
          });
          setGisRendered(true);
        }

        try {
          window.google.accounts.id.prompt();
        } catch (_) {}

        return true;
      } catch (err) {
        return false;
      }
    };

    if (!setupGoogleAuth()) {
      const interval = setInterval(() => {
        if (setupGoogleAuth()) {
          clearInterval(interval);
        }
      }, 300);
      return () => {
        active = false;
        clearInterval(interval);
      };
    }

    return () => {
      active = false;
    };
  }, [mode, loginWithGoogle, onSuccess]);

  const handleManualGoogleClick = () => {
    setError(null);
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            const iframeBtn = googleBtnContainerRef.current?.querySelector('div[role="button"]') as HTMLElement;
            if (iframeBtn) {
              iframeBtn.click();
            } else {
              setError('Google prompt blocked. Please click the Google button below.');
            }
          }
        });
      } catch {
        const iframeBtn = googleBtnContainerRef.current?.querySelector('div[role="button"]') as HTMLElement;
        if (iframeBtn) iframeBtn.click();
      }
    } else {
      setError('Google Identity Services library is loading. Please try again in a moment.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const res = await signup(name, email, password, targetField, targetRole);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Account created successfully! Redirecting...');
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
    <div className="max-w-md mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg text-left animate-fadeIn space-y-6 select-none">
      <div className="text-center space-y-2">
        <BrandWordmark className="mx-auto" />
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {mode === 'login' ? 'Candidate Sign In' : 'Candidate Registration'}
        </h1>
        <p className="text-xs text-[#a1a1aa]">
          {mode === 'login'
            ? 'Sign in to access your interview telemetry, rubrics, and ATS audit.'
            : 'Select your Google account from Chrome to immediately calibrate your workspace.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08] text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            mode === 'login'
              ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white shadow-xs'
              : 'text-[#a1a1aa] hover:text-white'
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
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            mode === 'signup'
              ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white shadow-xs'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Google OAuth Section */}
      <div className="space-y-3">
        <div className="flex justify-center w-full min-h-[44px]">
          <div ref={googleBtnContainerRef} className="w-full flex justify-center" />
        </div>

        {!gisRendered && (
          <button
            type="button"
            onClick={handleManualGoogleClick}
            disabled={googleLoading}
            className="w-full py-2.5 px-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white text-xs font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
          </button>
        )}

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-white/[0.08]" />
          <span className="absolute bg-[#141313] px-3 font-mono text-[10px] text-[#71717a] uppercase">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {mode === 'signup' && (
          <div>
            <label className="text-[#a1a1aa] block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
            />
          </div>
        )}

        <div>
          <label className="text-[#a1a1aa] block mb-1">Candidate Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="candidate@example.com"
            className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
          />
        </div>

        <div>
          <label className="text-[#a1a1aa] block mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
          />
        </div>

        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[#a1a1aa] block mb-1">Target Discipline</label>
              <select
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                className="w-full bg-black/50 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
              >
                <option value="it">IT Systems</option>
                <option value="management">Management</option>
                <option value="law">Law</option>
              </select>
            </div>
            <div>
              <label className="text-[#a1a1aa] block mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="btn-gradient-primary w-full py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <span>{mode === 'signup' ? 'Create Candidate Account' : 'Sign In'}</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default AuthScreen;
