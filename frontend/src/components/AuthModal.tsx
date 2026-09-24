import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from './BrandWordmark';

const GOOGLE_CLIENT_ID =
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

  // Initialize and render official Google Identity Services button inside Modal
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
              setError('Google identity verification was cancelled or failed.');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (modalGoogleBtnRef.current) {
          window.google.accounts.id.renderButton(modalGoogleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: isSignUp ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 320,
          });
        }

        setGisReady(true);
        return true;
      } catch (err: any) {
        console.warn('Google Identity Services modal setup warning:', err);
        return false;
      }
    };

    if (!setupGoogleModal()) {
      const interval = setInterval(() => {
        if (setupGoogleModal()) {
          clearInterval(interval);
        }
      }, 200);
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
      const res = await signup(name, email, password, targetField, targetRole);
      setLoading(false);
      if (res.success) {
        setAuthModalOpen(false);
      } else {
        setError(res.error || 'Failed to create account.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-[#E5E7EB] shadow-xl rounded-2xl w-full max-w-[420px] overflow-hidden text-left">
        {/* Header Bar */}
        <div className="bg-[#F8F9FA] px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <BrandWordmark />
          <button
            onClick={() => setAuthModalOpen(false)}
            className="text-[#6B7078] hover:text-[#17181C] text-sm p-1 rounded-lg hover:bg-[#E5E7EB] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F1F2F4] p-1 mx-5 mt-4 rounded-xl border border-[#E5E7EB] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              !isSignUp ? 'bg-white text-[#17181C] shadow-xs' : 'text-[#6B7078]'
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
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              isSignUp ? 'bg-white text-[#17181C] shadow-xs' : 'text-[#6B7078]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B23A2E] flex items-start gap-2 font-mono text-[11px]">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Official Google Button */}
          <div className="flex flex-col items-center justify-center space-y-2">
            {!gisReady && (
              <div className="w-full py-2.5 px-4 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center gap-3 text-xs text-[#6B7078] animate-pulse">
                <div className="w-4 h-4 border-2 border-[#6B7078] border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting to Google...</span>
              </div>
            )}

            <div
              ref={modalGoogleBtnRef}
              className="w-full flex justify-center min-h-[44px]"
            />

            {googleLoading && (
              <div className="text-[11px] text-[#2E6FF2] font-mono flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#2E6FF2] border-t-transparent rounded-full animate-spin"></div>
                <span>Reading Google profile...</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-[#E5E7EB]"></div>
            <span className="shrink mx-2 text-[10px] font-mono uppercase text-[#9CA3AF]">
              or email
            </span>
            <div className="flex-grow border-t border-[#E5E7EB]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#6B7078] uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl bg-[#F8F9FA] text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#6B7078] uppercase mb-1">
                    Career Track
                  </label>
                  <select
                    value={targetField}
                    onChange={(e) => {
                      setTargetField(e.target.value);
                      if (e.target.value === 'management') setTargetRole('Product Manager');
                      else if (e.target.value === 'law') setTargetRole('Corporate Counsel');
                      else setTargetRole('Frontend Developer');
                    }}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl bg-[#F8F9FA] text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
                  >
                    <option value="it">Information Technology</option>
                    <option value="management">Management & Leadership</option>
                    <option value="law">Law & Legal</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-mono font-bold text-[#6B7078] uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@example.com"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl bg-[#F8F9FA] text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-[#6B7078] uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl bg-[#F8F9FA] text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#17181C] hover:bg-[#2A2B30] text-white rounded-xl font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
