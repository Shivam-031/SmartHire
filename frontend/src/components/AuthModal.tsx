import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from './BrandWordmark';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, signup, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const targetField = 'it';
  const targetRole = 'Frontend Developer';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    // Create a base64 JWT-structured token that the backend verifies
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        iss: 'https://accounts.google.com',
        sub: 'google-modal-' + Date.now(),
        email: email.trim() || 'google.candidate@example.com',
        email_verified: true,
        name: name.trim() || 'Google Candidate',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
      })
    );
    const mockGoogleCredential = `${header}.${payload}.dev_signature`;

    const res = await loginWithGoogle(mockGoogleCredential, targetField, targetRole);
    setGoogleLoading(false);
    if (res.success) {
      setAuthModalOpen(false);
    } else {
      setError(res.error || 'Google authentication failed.');
    }
  };

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
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B23A2E] flex items-center gap-2 font-mono text-[11px]">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#F8F9FA] text-[#17181C] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-xl font-medium text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-[#17181C] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span className="font-semibold text-xs text-[#17181C]">Continue with Google</span>
          </button>

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
