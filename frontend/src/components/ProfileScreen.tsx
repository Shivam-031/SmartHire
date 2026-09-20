import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProfileScreenProps {
  onNavigateToFields?: (field: string) => void;
  onNavigateToResumeEditor?: () => void;
  onNavigateToTemplatePicker?: (resumeId?: string) => void;
  onNavigateToSession?: (sessionId: number) => void;
  onStartNewSession?: () => void;
  onNavigateToLogin?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToFields,
  onNavigateToResumeEditor,
  onNavigateToTemplatePicker,
  onNavigateToSession,
  onStartNewSession,
  onNavigateToLogin,
}) => {
  const { user, token, logout, updateUserProfile, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<{ sessions: any[]; resumes: any[] }>({
    sessions: [],
    resumes: [],
  });
  const [loading, setLoading] = useState(false);
  const [targetField, setTargetField] = useState(user?.target_field || 'it');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Frontend Developer');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetch('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setProfileData({
            sessions: data.sessions || [],
            resumes: data.resumes || [],
          });
          if (data.user) {
            setTargetField(data.user.target_field || 'it');
            setTargetRole(data.user.target_role || 'Frontend Developer');
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [token]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-8 bg-white border border-[#D2D5C9] rounded shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#EEF0EA] border border-[#D2D5C9] flex items-center justify-center mx-auto mb-4 text-[#5C6B60]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#1A2E22] mb-1">
            Candidate Authentication Required
          </h3>
          <p className="text-xs text-[#5C6B60] max-w-sm mx-auto mb-6">
            Sign in or create a candidate account to calibrate your career track, access saved resumes, and review past examination transcripts.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="px-6 py-2.5 bg-[#2F6F4E] text-white rounded text-xs font-medium hover:bg-[#25583E] transition-colors cursor-pointer shadow-sm"
          >
            Go to Candidate Sign In &rarr;
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ target_field: targetField, target_role: targetRole });
    if (onNavigateToFields) {
      onNavigateToFields(targetField);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-left max-w-[1000px] mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded border border-[#D2D5C9] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#2F6F4E] text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold text-[#1A2E22]">{user.name}</h2>
              <span className="text-[10px] font-score-mono uppercase text-[#2F6F4E] bg-[#EEF0EA] px-2 py-0.5 rounded border border-[#D2D5C9] font-semibold">
                Candidate ID #{user.id}
              </span>
            </div>
            <p className="text-xs text-[#5C6B60] font-score-mono">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartNewSession}
            className="px-4 py-2 bg-[#2F6F4E] text-white rounded text-xs font-medium hover:bg-[#25583E] transition-colors cursor-pointer shadow-xs"
          >
            Start Examination &rarr;
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 text-xs text-[#B23A2E] border border-[#B23A2E]/30 rounded hover:bg-[#FCF0EE] transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Target Track Calibration Form */}
      <div className="bg-white p-6 rounded border border-[#D2D5C9] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-3">
          <div>
            <h3 className="font-serif text-sm font-semibold text-[#1A2E22]">
              Active Career Discipline & Target Role Calibration
            </h3>
            <p className="text-[11px] text-[#5C6B60]">
              Customizes oral examination rubrics (keyword vs. SAR vs. IRAC) and ATS scoring heuristics.
            </p>
          </div>
          {savedSuccess && (
            <span className="text-[11px] font-score-mono text-[#2F6F4E] font-medium bg-[#EEF0EA] px-2.5 py-1 rounded border border-[#2F6F4E]/30">
              Preferences Saved Successfully
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateTrack} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-score-mono uppercase text-[#5C6B60] mb-1.5 font-medium">
              Career Track
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
              className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#F7F8F5] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E]"
            >
              <option value="it">Information Technology (Code & Architecture)</option>
              <option value="management">Management & Leadership (SAR Rubric)</option>
              <option value="law">Legal & Regulatory (IRAC Rubric)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-score-mono uppercase text-[#5C6B60] mb-1.5 font-medium">
              Target Position / Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 border border-[#D2D5C9] rounded bg-[#F7F8F5] text-[#1A2E22] focus:outline-none focus:border-[#2F6F4E]"
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

          <div className="md:col-span-2 pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#2F6F4E] text-white rounded text-xs font-medium hover:bg-[#25583E] transition-colors cursor-pointer shadow-xs"
            >
              Save Track Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Two Quiet Lists: Saved Resumes & Past Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List 1: Saved Resumes (MongoDB Document Store) */}
        <div className="bg-white p-6 rounded border border-[#D2D5C9] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2F6F4E]" />
              <h3 className="font-serif text-sm font-semibold text-[#1A2E22]">
                Saved Resume Dossiers
              </h3>
            </div>
            <button
              onClick={onNavigateToResumeEditor}
              className="text-xs text-[#2F6F4E] hover:underline font-medium"
            >
              + Open Editor
            </button>
          </div>

          {loading ? (
            <div className="py-8"><LoadingSpinner message="Retrieving resumes..." /></div>
          ) : profileData.resumes.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#5C6B60]">
              <p>No saved resumes registered yet.</p>
              <button
                onClick={onNavigateToResumeEditor}
                className="mt-2 text-[#2F6F4E] font-medium hover:underline inline-block"
              >
                Create your first structured resume &rarr;
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#D2D5C9]/60 text-xs">
              {profileData.resumes.map((r, i) => (
                <div key={i} className="py-3 flex items-center justify-between hover:bg-[#F7F8F5] px-1 rounded transition-colors">
                  <div>
                    <h4 className="font-medium text-[#1A2E22]">{r.title}</h4>
                    <p className="text-[10px] text-[#5C6B60] font-score-mono">
                      {r.type === 'uploaded' ? 'Uploaded File' : `Template #${r.template_id || 1}`} · {r.last_updated ? new Date(r.last_updated).toLocaleDateString() : 'Active'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToTemplatePicker?.(r.id)}
                      className="px-2.5 py-1 bg-white border border-[#D2D5C9] hover:border-[#2F6F4E] text-[11px] rounded transition-colors"
                      title="Export PDF using template"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* List 2: Past Examination Sessions (SQL Relational Store) */}
        <div className="bg-white p-6 rounded border border-[#D2D5C9] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2F6F4E]" />
              <h3 className="font-serif text-sm font-semibold text-[#1A2E22]">
                Past Examination Sessions
              </h3>
            </div>
            <button
              onClick={onStartNewSession}
              className="text-xs text-[#2F6F4E] hover:underline font-medium"
            >
              + New Session
            </button>
          </div>

          {loading ? (
            <div className="py-8"><LoadingSpinner message="Retrieving sessions..." /></div>
          ) : profileData.sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#5C6B60]">
              <p>No completed examination sessions recorded yet.</p>
              <button
                onClick={onStartNewSession}
                className="mt-2 text-[#2F6F4E] font-medium hover:underline inline-block"
              >
                Launch an examination session &rarr;
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#D2D5C9]/60 text-xs">
              {profileData.sessions.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between hover:bg-[#F7F8F5] px-1 rounded transition-colors">
                  <div>
                    <h4 className="font-medium text-[#1A2E22]">
                      Session #{s.id} · <span className="uppercase text-[10px] font-score-mono text-[#5C6B60]">{s.field}</span> {s.role}
                    </h4>
                    <p className="text-[10px] text-[#5C6B60] font-score-mono">
                      Mode: {s.mode === 'mock' ? 'Mock (Scripted Branching)' : 'Standard Q&A'} · {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recorded'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.overall_score !== null && (
                      <span className="font-score-mono font-bold text-xs text-[#2F6F4E]">
                        {s.overall_score}%
                      </span>
                    )}
                    <button
                      onClick={() => onNavigateToSession?.(s.id)}
                      className="px-2.5 py-1 bg-white border border-[#D2D5C9] hover:border-[#2F6F4E] text-[11px] rounded transition-colors"
                    >
                      Dossier &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;

