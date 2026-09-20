import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from './BrandWordmark';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetField, setTargetField] = useState('it');
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignUp) {
      const res = await signup(name, email, password, targetField, targetRole);
      setLoading(false);
      if (res.success) {
        onSuccess?.();
      } else {
        setError(res.error || 'Failed to create account.');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onSuccess?.();
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-[420px] bg-white border border-[#D2D5C9] shadow-sm rounded overflow-hidden text-left">
        {/* Card Header */}
        <div className="bg-[#EEF0EA] px-6 py-4 hairline-b flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandWordmark />
            <span className="text-[10px] font-score-mono uppercase text-[#5C6B60] tracking-wider border border-[#D2D5C9] px-1.5 py-0.5 rounded bg-white font-medium">
              AUTH & ACCESS
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex hairline-b bg-white">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-3 text-xs font-medium text-center transition-colors ${
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
            className={`flex-1 py-3 text-xs font-medium text-center transition-colors ${
              isSignUp
                ? 'border-b-2 border-[#2F6F4E] text-[#1A2E22] font-semibold bg-[#F7F8F5]'
                : 'text-[#5C6B60] hover:text-[#1A2E22]'
            }`}
          >
            Create Docket Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-[#FCF0EE] border border-[#B23A2E]/30 rounded text-[#B23A2E] flex items-start gap-2 text-[11px] leading-relaxed">
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-medium text-[#1A2E22] mb-1 font-score-mono uppercase tracking-wider">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Alex Mercer"
                className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#F7F8F5] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:bg-white text-xs transition-colors"
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
              className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#F7F8F5] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:bg-white text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#1A2E22] mb-1 font-score-mono uppercase tracking-wider">
              Access Credential (Password)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#F7F8F5] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:bg-white text-xs transition-colors font-mono"
            />
            <p className="text-[10px] text-[#5C6B60] mt-1 font-score-mono">
              Requirement: Minimum 6 alphanumeric characters.
            </p>
          </div>

          {isSignUp && (
            <div className="pt-2 border-t border-[#D2D5C9] space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#1A2E22] mb-1 font-score-mono uppercase tracking-wider">
                  Target Career Discipline
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
                  className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#F7F8F5] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:bg-white text-xs transition-colors"
                >
                  <option value="it">Information Technology (Code, Architecture & Design)</option>
                  <option value="management">Management & Leadership (SAR Rubric, Strategy)</option>
                  <option value="law">Legal & Regulatory (IRAC Rubric, Compliance)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#1A2E22] mb-1 font-score-mono uppercase tracking-wider">
                  Target Role Calibration
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#F7F8F5] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E] focus:bg-white text-xs transition-colors"
                >
                  {targetField === 'it' && (
                    <>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="QA / Test Engineer">QA / Test Engineer</option>
                    </>
                  )}
                  {targetField === 'management' && (
                    <>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Operations Manager">Operations Manager</option>
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

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2F6F4E] text-white rounded font-medium hover:bg-[#25583E] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
            >
              {loading ? (
                <span>Authenticating with server...</span>
              ) : isSignUp ? (
                <span>Create account</span>
              ) : (
                <span>Log in</span>
              )}
            </button>
          </div>
        </form>

        <div className="bg-[#EEF0EA] px-6 py-3 hairline-t text-center text-[10px] text-[#5C6B60]">
          Secured with SHA-256 / Bcrypt salted credentials and stateless JWT session keys.
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;

