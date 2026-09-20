import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserProfileProps {
  onSelectResume?: (resumeId: string) => void;
  onSelectSession?: (sessionId: number) => void;
  onNavigateToField?: (field: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  onSelectSession,
  onNavigateToField
}) => {
  const { user, token, logout, profileModalOpen, setProfileModalOpen, updateUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<{ sessions: any[]; resumes: any[] }>({ sessions: [], resumes: [] });
  const [loading, setLoading] = useState(false);
  const [targetField, setTargetField] = useState(user?.target_field || 'it');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Frontend Developer');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profileModalOpen && token) {
      setLoading(true);
      fetch('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setProfileData({
            sessions: data.sessions || [],
            resumes: data.resumes || []
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2E22]/40 backdrop-blur-[2px] animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#D2D5C9] shadow-[0_4px_24px_rgba(26,46,34,0.12)] rounded w-full max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#EEF0EA] px-6 py-4 hairline-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F6F4E]" />
            <h3 className="font-serif font-semibold text-sm text-[#1A2E22] tracking-wide">
              Candidate Dossier & Track Preferences
            </h3>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="text-[#5C6B60] hover:text-[#1A2E22] text-sm p-1 rounded hover:bg-[#E3E8DF] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#1A2E22]">
          {/* Identity Card */}
          <div className="p-4 bg-[#F7F8F5] border border-[#D2D5C9] rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2F6F4E] text-white flex items-center justify-center font-serif text-base font-bold shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#1A2E22]">{user.name}</h4>
                <p className="text-[11px] text-[#5C6B60] font-score-mono">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); setProfileModalOpen(false); }}
              className="px-3 py-1.5 text-xs text-[#B23A2E] border border-[#B23A2E]/30 rounded hover:bg-[#FCF0EE] transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Target Track Settings */}
          <form onSubmit={handleUpdateTrack} className="space-y-3 p-4 border border-[#D2D5C9] rounded bg-white">
            <div className="flex items-center justify-between">
              <span className="font-score-mono text-[11px] text-[#5C6B60] uppercase tracking-wider font-semibold">
                Active Career Track Assignment
              </span>
              {savedSuccess && (
                <span className="text-[10px] text-[#2F6F4E] font-medium bg-[#E8F3ED] px-2 py-0.5 rounded border border-[#2F6F4E]/30">
                  Track Saved ✓
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#5C6B60] mb-1">Field Track</label>
                <select
                  value={targetField}
                  onChange={(e) => {
                    const f = e.target.value;
                    setTargetField(f);
                    if (f === 'it') setTargetRole('Frontend Developer');
                    else if (f === 'management') setTargetRole('Product Manager');
                    else if (f === 'law') setTargetRole('Corporate Counsel');
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#D2D5C9] rounded text-xs bg-[#FAFAF8] focus:border-[#2F6F4E]"
                >
                  <option value="it">Information Technology</option>
                  <option value="management">Management & Leadership</option>
                  <option value="law">Legal & Regulatory</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#5C6B60] mb-1">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#D2D5C9] rounded text-xs bg-[#FAFAF8] focus:border-[#2F6F4E]"
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

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#2F6F4E] hover:bg-[#25583E] text-white text-xs font-medium rounded transition-colors"
              >
                Save Track Settings
              </button>
            </div>
          </form>

          {/* Saved Structured Resumes */}
          <div>
            <div className="font-score-mono text-[11px] text-[#5C6B60] uppercase tracking-wider font-semibold mb-2">
              Saved Resumes (MongoDB & SQL)
            </div>
            {profileData.resumes.length === 0 ? (
              <p className="text-[11px] text-[#5C6B60] italic">No saved resume documents found.</p>
            ) : (
              <div className="space-y-1.5">
                {profileData.resumes.map((r, idx) => (
                  <div key={idx} className="p-2.5 bg-[#F7F8F5] border border-[#D2D5C9] rounded flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[#1A2E22]">{r.title}</span>
                      <span className="text-[10px] text-[#5C6B60] ml-2 font-score-mono">
                        {r.type === 'uploaded' ? 'Uploaded PDF' : `Template #${r.template_id || 1}`}
                      </span>
                    </div>
                    <span className="text-[10px] font-score-mono text-[#5C6B60]">
                      {r.last_updated ? new Date(r.last_updated).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Sessions History */}
          <div>
            <div className="font-score-mono text-[11px] text-[#5C6B60] uppercase tracking-wider font-semibold mb-2">
              Recent Examination Sessions
            </div>
            {loading ? (
              <p className="text-[11px] text-[#5C6B60]">Loading records...</p>
            ) : profileData.sessions.length === 0 ? (
              <p className="text-[11px] text-[#5C6B60] italic">No completed sessions logged yet.</p>
            ) : (
              <div className="space-y-1.5">
                {profileData.sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (onSelectSession) onSelectSession(s.id);
                      setProfileModalOpen(false);
                    }}
                    className="w-full p-2.5 bg-[#F7F8F5] hover:bg-[#EAECE6] border border-[#D2D5C9] rounded flex items-center justify-between transition-colors text-left"
                  >
                    <div>
                      <span className="font-medium text-[#1A2E22]">{s.role}</span>
                      <span className="text-[10px] font-score-mono uppercase text-[#5C6B60] ml-2 px-1.5 py-0.5 rounded bg-white border border-[#D2D5C9]">
                        {s.mode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-score-mono font-bold text-xs text-[#2F6F4E]">
                        {s.overall_score !== null ? `${s.overall_score}%` : 'In Progress'}
                      </span>
                      <span className="text-[10px] text-[#5C6B60] font-score-mono">&rarr;</span>
                    </div>
                  </button>
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

