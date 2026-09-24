import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
      fetch('http://localhost:5000/api/profile', {
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
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 animate-fadeIn">
        <div className="p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto text-[#6B7078]">
            <span className="material-symbols-outlined text-[26px]">person</span>
          </div>
          <h3 className="text-lg font-bold text-[#17181C]">Candidate Authentication Required</h3>
          <p className="text-xs text-[#6B7078] max-w-sm mx-auto">
            Please sign in to access your candidate dossier, telemetry dashboards, and session records.
          </p>
          {onNavigateToLogin && (
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-2.5 bg-[#17181C] text-white rounded-xl text-xs font-semibold hover:bg-[#2A2B30] transition-colors cursor-pointer"
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

  const getDomainColor = () => {
    if (targetField === 'management') return '#8B4FE0';
    if (targetField === 'law') return '#0EA5B7';
    return '#2E6FF2';
  };

  const domainColor = getDomainColor();

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Profile Header Card (Stitch Screen 15) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl text-white flex items-center justify-center font-bold text-2xl shadow-xs"
            style={{ backgroundColor: domainColor }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#17181C]">{user.name}</h1>
              <span
                className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                style={{ backgroundColor: `${domainColor}15`, color: domainColor }}
              >
                {targetField.toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-mono text-[#6B7078]">{user.email}</p>
            <p className="text-xs text-[#17181C]">
              Target: <strong className="font-semibold">{targetRole}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onStartNewSession && (
            <button
              type="button"
              onClick={onStartNewSession}
              className="px-4 py-2.5 bg-[#17181C] hover:bg-[#2A2B30] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Session</span>
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 bg-white border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#B23A2E] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calibration Settings */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
            <span className="material-symbols-outlined text-[20px]" style={{ color: domainColor }}>
              tune
            </span>
            <h2 className="text-base font-bold text-[#17181C]">Track Calibration</h2>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="font-mono text-[11px] text-[#6B7078] uppercase font-bold block mb-1.5">
                Career Vertical
              </label>
              <select
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] text-[#17181C] focus:outline-hidden focus:border-[#17181C] font-semibold"
              >
                <option value="it">Information Technology</option>
                <option value="management">Management & Leadership</option>
                <option value="law">Law & Governance</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[11px] text-[#6B7078] uppercase font-bold block mb-1.5">
                Specialization / Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] text-[#17181C] focus:outline-hidden focus:border-[#17181C]"
              />
            </div>

            {saveSuccess && (
              <div className="p-2.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] font-mono text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Profile track calibrated successfully</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#17181C] hover:bg-[#2A2B30] text-white rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Update Calibration
            </button>
          </form>
        </div>

        {/* Right Column: Resumes and Sessions Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saved Structured Resumes */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#2E6FF2]">
                  description
                </span>
                <h2 className="text-base font-bold text-[#17181C]">Saved Resume Dossiers</h2>
              </div>
              {onNavigateToResumeEditor && (
                <button
                  type="button"
                  onClick={onNavigateToResumeEditor}
                  className="text-xs font-semibold text-[#2E6FF2] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>New Resume</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs font-mono text-[#6B7078]">
                Loading resumes...
              </div>
            ) : profileData.resumes && profileData.resumes.length > 0 ? (
              <div className="space-y-2.5">
                {profileData.resumes.map((r: any) => (
                  <div
                    key={r.id || r._id}
                    className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#17181C]">
                        {r.title || r.contact?.name || 'Untitled Resume'}
                      </h4>
                      <p className="text-[11px] font-mono text-[#6B7078]">
                        Updated {r.last_updated ? new Date(r.last_updated).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onNavigateToTemplatePicker && (
                        <button
                          type="button"
                          onClick={() => onNavigateToTemplatePicker(r.id || r._id)}
                          className="px-2.5 py-1 bg-white border border-[#E5E7EB] hover:bg-[#EEF0EA] rounded-lg text-[11px] font-semibold text-[#17181C] cursor-pointer"
                        >
                          Templates
                        </button>
                      )}
                      {onNavigateToResumeEditor && (
                        <button
                          type="button"
                          onClick={onNavigateToResumeEditor}
                          className="px-2.5 py-1 bg-[#17181C] text-white hover:bg-[#2A2B30] rounded-lg text-[11px] font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6B7078] py-4 text-center">
                No structured resumes saved yet.
              </p>
            )}
          </div>

          {/* Recent Examination Sessions */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#059669]">
                  history_edu
                </span>
                <h2 className="text-base font-bold text-[#17181C]">Recent Simulation Dockets</h2>
              </div>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs font-mono text-[#6B7078]">
                Loading session archives...
              </div>
            ) : profileData.sessions && profileData.sessions.length > 0 ? (
              <div className="space-y-2.5">
                {profileData.sessions.slice(0, 4).map((s: any) => {
                  const scorePct =
                    s.overall_score !== null && s.overall_score !== undefined
                      ? Math.round(s.overall_score * 100)
                      : 80;
                  return (
                    <div
                      key={s.id}
                      onClick={() => onNavigateToSession && onNavigateToSession(s.id)}
                      className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] hover:bg-white hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#17181C]">{s.role}</h4>
                          <span className="font-mono text-[10px] uppercase bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                            {s.field || 'IT'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[#6B7078]">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Active'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#059669]">
                          {scorePct}% Score
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-[#6B7078]">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#6B7078] py-4 text-center">
                No completed simulation records found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
