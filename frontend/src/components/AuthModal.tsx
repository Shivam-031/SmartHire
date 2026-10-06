import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from './BrandWordmark';

const GOOGLE_CLIENT_ID =
  (import.meta.env as any).GOOGLE_CLIENT_ID ||
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '228003091405-8p3lrjrfg1mo4nal0sru1417j95hqgef.apps.googleusercontent.com';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, signup, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetField, setTargetField] = useState('it');
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [gisReady, setGisReady] = useState(false);

  const modalGoogleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authModalOpen) return;

    let active = true;

    const setupGoogleModal = () => {
      if (!active) return false;
      if (!window.google?.accounts?.id || !modalGoogleBtnRef.current) return false;

      try {
        if (modalGoogleBtnRef.current) {
          modalGoogleBtnRef.current.innerHTML = '';
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response?.credential) {
              setGoogleLoading(true);
              setError(null);
              const res = await loginWithGoogle(response.credential, targetField, targetRole);
              setGoogleLoading(false);
              if (res.success) {
                setAuthModalOpen(false);
              } else {
                setError(res.error || 'Google authentication failed.');
              }
            } else {
              setError('Google identity verification was cancelled.');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (modalGoogleBtnRef.current) {
          window.google.accounts.id.renderButton(modalGoogleBtnRef.current, {
            type: 'standard',
            shape: 'pill',
            theme: 'filled_black',
            text: isSignUp ? 'signup_with' : 'signin_with',
            size: 'large',
            logo_alignment: 'left',
            width: 340,
          });
          setGisReady(true);
        }

        return true;
      } catch {
        return false;
      }
    };

    if (!setupGoogleModal()) {
      const interval = setInterval(() => {
        if (setupGoogleModal()) {
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
  }, [authModalOpen, isSignUp, targetField, targetRole, loginWithGoogle, setAuthModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const res = await signup(name, email, password, targetField, targetRole);
      setLoading(false);
      if (res.success) {
        setAuthModalOpen(false);
      } else {
        setError(res.error || 'Registration failed.');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        setAuthModalOpen(false);
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#141313] border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-3xl w-full max-w-[420px] overflow-hidden text-left">
        {/* Header Bar */}
        <div className="bg-white/[0.02] px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <BrandWordmark />
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="text-[#71717a] hover:text-white text-sm p-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/[0.03] p-1 mx-5 mt-4 rounded-2xl border border-white/[0.08] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              !isSignUp
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white shadow-xs'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              isSignUp
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white shadow-xs'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 flex items-start gap-2 font-mono text-[11px]">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Official Google Button */}
          <div className="flex flex-col items-center justify-center space-y-2">
            {!gisReady && (
              <div className="w-full py-2.5 px-4 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center gap-3 text-xs text-[#a1a1aa] animate-pulse">
                <div className="w-4 h-4 border-2 border-[#a1a1aa] border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </div>
            )}

            <div ref={modalGoogleBtnRef} className="w-full flex justify-center min-h-[44px]" />

            {googleLoading && (
              <div className="text-[11px] text-[#22d3ee] font-mono flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
                <span>Verifying Google account...</span>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t border-white/[0.08]" />
            <span className="absolute bg-[#141313] px-3 font-mono text-[10px] text-[#71717a] uppercase">
              Or email credentials
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
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
              <label className="text-[#a1a1aa] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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

            {isSignUp && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[#a1a1aa] block mb-1">Track</label>
                  <select
                    value={targetField}
                    onChange={(e) => setTargetField(e.target.value)}
                    className="w-full bg-black/50 border border-white/[0.1] rounded-xl px-2 py-2 text-white text-[11px] focus:outline-none focus:border-[#7c3aed]"
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
                    className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-2 py-2 text-white text-[11px] focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{isSignUp ? 'Create Candidate Account' : 'Sign In'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
