import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserProfileProps {
  onSelectResume?: (resumeId: string) => void;
  onSelectSession?: (sessionId: number) => void;
  onNavigateToField?: (field: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  onSelectSession,
  onNavigateToField,
}) => {
  const { user, token, logout, profileModalOpen, setProfileModalOpen, updateUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<{ sessions: any[]; resumes: any[] }>({
    sessions: [],
    resumes: [],
  });
  const [loading, setLoading] = useState(false);
  const [targetField, setTargetField] = useState(user?.target_field || 'it');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Frontend Developer');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profileModalOpen && token) {
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
  }, [profileModalOpen, token]);

  if (!profileModalOpen || !user) return null;

  const handleUpdateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ target_field: targetField, target_role: targetRole });
    if (onNavigateToField) {
      onNavigateToField(targetField);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#141313] border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-3xl w-full max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="bg-white/[0.02] px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc]" />
            <h3 className="font-semibold text-sm sm:text-base text-white">
              Candidate Dossier & Track Assignment
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="text-[#71717a] hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-white">
          {/* Identity Card */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] text-white flex items-center justify-center text-lg font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">{user.name}</h4>
                <p className="text-[11px] text-[#a1a1aa] font-mono">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                setProfileModalOpen(false);
              }}
              className="px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* Target Track Settings Form */}
          <form
            onSubmit={handleUpdateTrack}
            className="space-y-3 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
          >
            <span className="font-mono text-[10px] text-[#71717a] uppercase tracking-wider block font-semibold">
              Active Career Track Calibration
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#a1a1aa] block mb-1">Discipline Vertical</label>
                <select
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/[0.1] bg-black/50 text-white font-medium focus:outline-none focus:border-[#7c3aed]"
                >
                  <option value="it">Information Technology</option>
                  <option value="management">Management & Strategy</option>
                  <option value="law">Law & Governance</option>
                </select>
              </div>

              <div>
                <label className="text-[#a1a1aa] block mb-1">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/[0.1] bg-black/50 text-white focus:outline-none focus:border-[#7c3aed]"
                />
              </div>
            </div>

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                ✓ Track calibrated successfully
              </div>
            )}

            <button
              type="submit"
              className="btn-gradient-primary w-full py-2.5 text-xs font-semibold cursor-pointer shadow-md mt-1"
            >
              Update Career Calibration
            </button>
          </form>

          {/* Practice Sessions Archive */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-[#71717a] uppercase tracking-wider block">
              Recent Practice Telemetry
            </span>
            {loading ? (
              <p className="text-[#71717a] text-xs">Loading records...</p>
            ) : profileData.sessions.length === 0 ? (
              <p className="text-[#71717a] text-xs">No simulation sessions found.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {profileData.sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (onSelectSession) onSelectSession(s.id);
                      setProfileModalOpen(false);
                    }}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-white">Session #{s.id}</span>
                      <span className="text-[11px] text-[#a1a1aa] font-mono ml-2">
                        {s.role} ({s.mode})
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#22d3ee] font-bold">
                      {s.overall_score !== null ? `${Math.round(s.overall_score * 100)}%` : '—'}
                    </span>
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

export default UserProfile;
