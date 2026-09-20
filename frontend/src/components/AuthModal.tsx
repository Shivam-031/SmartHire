import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from './BrandWordmark';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetField, setTargetField] = useState('it');
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2E22]/40 backdrop-blur-[2px] animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#D2D5C9] shadow-[0_4px_24px_rgba(26,46,34,0.12)] rounded w-full max-w-[420px] overflow-hidden">
        {/* Header Docket Bar */}
        <div className="bg-[#EEF0EA] px-5 py-3.5 hairline-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandWordmark />
            <span className="text-[10px] font-score-mono uppercase text-[#5C6B60] tracking-wider border border-[#D2D5C9] px-1.5 py-0.5 rounded bg-white">
              AUTH-2.4
            </span>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="text-[#5C6B60] hover:text-[#1A2E22] text-sm p-1 rounded hover:bg-[#E3E8DF] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex hairline-b bg-white">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
              !isSignUp
                ? 'border-b-2 border-[#2F6F4E] text-[#1A2E22] font-semibold bg-[#F7F8F5]'
                : 'text-[#5C6B60] hover:text-[#1A2E22]'
            }`}
          >
            Candidate Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
              isSignUp
                ? 'border-b-2 border-[#2F6F4E] text-[#1A2E22] font-semibold bg-[#F7F8F5]'
                : 'text-[#5C6B60] hover:text-[#1A2E22]'
            }`}
          >
            Create Docket Profile
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-[#FCF0EE] border border-[#B23A2E]/30 rounded text-[#B23A2E] flex items-start gap-2 text-[11px] leading-relaxed">
              <span className="font-bold">Notice:</span>
              <span>{error}</span>
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-medium text-[#1A2E22] mb-1 font-score-mono uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full px-3 py-2 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:ring-1 focus:ring-[#2F6F4E] bg-[#FAFAF8]"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#1A2E22] mb-1 font-score-mono uppercase tracking-wider">
              Institutional / Corporate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@organization.com"
              className="w-full px-3 py-2 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:ring-1 focus:ring-[#2F6F4E] bg-[#FAFAF8]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#1A2E22] mb-1 font-score-mono uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:ring-1 focus:ring-[#2F6F4E] bg-[#FAFAF8]"
            />
          </div>

          {isSignUp && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-[#1A2E22] mb-1 font-score-mono uppercase tracking-wider">
                  Primary Track
                </label>
                <select
                  value={targetField}
                  onChange={(e) => {
                    const f = e.target.value;
                    setTargetField(f);
                    if (f === 'it') setTargetRole('Frontend Developer');
                    else if (f === 'management') setTargetRole('Product Manager');
                    else if (f === 'law') setTargetRole('Corporate Counsel');
                  }}
                  className="w-full px-2.5 py-2 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] bg-[#FAFAF8] focus:outline-none focus:border-[#2F6F4E]"
                >
                  <option value="it">Information Technology</option>
                  <option value="management">Management & Leadership</option>
                  <option value="law">Legal & Regulatory</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#1A2E22] mb-1 font-score-mono uppercase tracking-wider">
                  Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-2.5 py-2 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] bg-[#FAFAF8] focus:outline-none focus:border-[#2F6F4E]"
                >
                  {targetField === 'it' && (
                    <>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full Stack Engineer">Full Stack Engineer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                    </>
                  )}
                  {targetField === 'management' && (
                    <>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Operations Lead">Operations Lead</option>
                      <option value="Engineering Manager">Engineering Manager</option>
                    </>
                  )}
                  {targetField === 'law' && (
                    <>
                      <option value="Corporate Counsel">Corporate Counsel</option>
                      <option value="Compliance Officer">Compliance Officer</option>
                      <option value="Legal Analyst">Legal Analyst</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2F6F4E] hover:bg-[#25583E] text-white text-xs font-medium rounded transition-all shadow-[0_1px_3px_rgba(26,46,34,0.12)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                'Provision Candidate Profile &rarr;'
              ) : (
                'Authenticate Credential &rarr;'
              )}
            </button>
          </div>

          <div className="text-[11px] text-[#5C6B60] text-center pt-2 leading-relaxed">
            By authenticating, session evaluation metrics and structured resume drafts are encrypted and logged to the candidate dossier.
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

