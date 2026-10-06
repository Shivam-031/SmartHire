import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';

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
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (token) {
      setLoading(true);
      fetch(buildApiUrl('/api/profile'), {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.status === 401) {
            logout();
            if (onNavigateToLogin) onNavigateToLogin();
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (!isMounted || !data) return;
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
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [token, logout, onNavigateToLogin]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 animate-fadeIn select-none">
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#c084fc]">
            <span className="material-symbols-outlined text-[26px]">person</span>
          </div>
          <h3 className="text-lg font-bold text-white">Candidate Authentication Required</h3>
          <p className="text-xs text-[#a1a1aa] max-w-sm mx-auto">
            Please sign in to access your candidate dossier, telemetry dashboards, and session records.
          </p>
          {onNavigateToLogin && (
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="btn-gradient-primary px-6 py-2.5 text-xs font-semibold shadow-md cursor-pointer"
            >
              Sign In to Candidate Account
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ target_field: targetField, target_role: targetRole });
    if (onNavigateToFields) {
      onNavigateToFields(targetField);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const getDomainConfig = () => {
    switch (targetField) {
      case 'management':
        return {
          name: 'Management & Strategy',
          color: '#8b5cf6',
          textColor: '#c084fc',
          tag: 'MGMT',
        };
      case 'law':
        return {
          name: 'Law & Governance',
          color: '#0EA5B7',
          textColor: '#22d3ee',
          tag: 'LAW',
        };
      case 'it':
      default:
        return {
          name: 'IT & Software Engineering',
          color: '#3b82f6',
          textColor: '#60a5fa',
          tag: 'IT',
        };
    }
  };

  const domain = getDomainConfig();

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 text-left animate-fadeIn select-none">
      {/* Top Profile Dossier Hero (Stitch Screen Profile) */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] text-white flex items-center justify-center font-bold text-2xl shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{user.name}</h1>
              <span
                className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${domain.color}20`, color: domain.textColor }}
              >
                {domain.tag}
              </span>
            </div>
            <p className="text-xs font-mono text-[#a1a1aa]">{user.email}</p>
            <p className="text-xs text-[#71717a]">
              Target Specialization: <strong className="text-white font-medium">{targetRole}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onStartNewSession && (
            <button
              type="button"
              onClick={onStartNewSession}
              className="btn-gradient-primary px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Session</span>
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-red-400 rounded-2xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calibration Settings */}
        <div className="lg:col-span-1 rounded-3xl p-6 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <span className="material-symbols-outlined text-[20px] text-[#c084fc]">tune</span>
            <h2 className="text-sm font-bold text-white">Track Calibration</h2>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="font-mono text-[11px] text-[#71717a] uppercase font-bold block mb-1.5">
                Career Vertical
              </label>
              <select
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/[0.1] bg-black/40 text-white focus:outline-none focus:border-[#7c3aed] font-medium"
              >
                <option value="it" className="bg-[#141313] text-white">IT & Software Engineering</option>
                <option value="management" className="bg-[#141313] text-white">Management & Leadership</option>
                <option value="law" className="bg-[#141313] text-white">Law & Governance</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[11px] text-[#71717a] uppercase font-bold block mb-1.5">
                Specialization / Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full px-3 py-2.5 rounded-xl border border-white/[0.1] bg-black/40 text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            {saveSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Profile track calibrated successfully</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-gradient-primary w-full py-2.5 text-xs font-semibold cursor-pointer shadow-md"
            >
              Update Calibration
            </button>
          </form>
        </div>

        {/* Right Column: Resumes and Sessions Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saved Structured Resumes */}
          <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#22d3ee]">description</span>
                <h3 className="text-sm font-bold text-white">Structured Markdown Resumes</h3>
              </div>
              {onNavigateToResumeEditor && (
                <button
                  type="button"
                  onClick={onNavigateToResumeEditor}
                  className="text-xs font-mono text-[#c084fc] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>New Resume</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-4 text-center text-xs font-mono text-[#71717a]">Loading records...</div>
            ) : profileData.resumes.length === 0 ? (
              <p className="text-xs text-[#71717a] py-2">
                No structured resumes created yet. Use the Markdown Studio to build an ATS-optimized profile.
              </p>
            ) : (
              <div className="space-y-2.5">
                {profileData.resumes.map((res: any) => (
                  <div
                    key={res.id || res._id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white">{res.title || 'Untitled Resume'}</h4>
                      <p className="text-[11px] text-[#71717a] font-mono mt-0.5">
                        {res.target_role || targetRole} • {res.updated_at ? new Date(res.updated_at).toLocaleDateString() : 'Active'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onNavigateToTemplatePicker && (
                        <button
                          type="button"
                          onClick={() => onNavigateToTemplatePicker(res.id || res._id)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-[#22d3ee] border border-white/[0.08] cursor-pointer"
                        >
                          Templates
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Practice Sessions Telemetry */}
          <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#10b981]">history</span>
                <h3 className="text-sm font-bold text-white">Completed Practice Sessions</h3>
              </div>
              <span className="font-mono text-xs text-[#71717a]">
                {profileData.sessions.length} Recorded
              </span>
            </div>

            {loading ? (
              <div className="p-4 text-center text-xs font-mono text-[#71717a]">Loading telemetry...</div>
            ) : profileData.sessions.length === 0 ? (
              <p className="text-xs text-[#71717a] py-2">
                No sessions completed yet. Initiate an interview simulation to build your readiness index.
              </p>
            ) : (
              <div className="space-y-2.5">
                {profileData.sessions.map((s: any) => (
                  <div
                    key={s.id}
                    onClick={() => onNavigateToSession && onNavigateToSession(s.id)}
                    className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">Session #{s.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#a1a1aa]">
                          {s.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717a] font-mono mt-0.5">
                        {s.date ? new Date(s.date).toLocaleDateString() : 'Recent'} • Mode: {s.mode}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#22d3ee]">
                        {s.overall_score !== null ? `${Math.round(s.overall_score * 100)}%` : '—'}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-[#71717a]">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
