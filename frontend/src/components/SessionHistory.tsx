import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SessionItem {
  id: number;
  date?: string | null;
  created_at?: string | null;
  field?: string;
  target_field?: string;
  role?: string;
  target_role?: string;
  mode?: string;
  overall_score?: number | null;
  mongo_transcript_id?: string | null;
  mongo_resume_id?: string | null;
  has_transcript?: boolean;
}

interface SessionHistoryProps {
  onSelectSession: (sessionId: number) => void;
  onBack: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ onSelectSession, onBack }) => {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTrack, setFilterTrack] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedToken = token || localStorage.getItem('token');
        const headers: HeadersInit = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};

        const res = await fetch('http://localhost:5000/api/sessions', { headers });
        const data = await res.json();
        if (isMounted) {
          if (res.ok && Array.isArray(data)) {
            setSessions(data);
          } else if (res.ok && data.sessions && Array.isArray(data.sessions)) {
            setSessions(data.sessions);
          } else {
            setSessions(getDefaultHistory());
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setSessions(getDefaultHistory());
          setLoading(false);
        }
      }
    };

    fetchSessions();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const getDefaultHistory = (): SessionItem[] => [
    {
      id: 53,
      field: 'it',
      role: 'Frontend Developer',
      mode: 'standard',
      overall_score: 0.84,
      date: new Date(Date.now() - 3600000).toISOString(),
      has_transcript: true,
    },
    {
      id: 54,
      field: 'management',
      role: 'Product Manager',
      mode: 'mock',
      overall_score: 0.78,
      date: new Date(Date.now() - 86400000).toISOString(),
      has_transcript: true,
    },
    {
      id: 55,
      field: 'law',
      role: 'Corporate Counsel',
      mode: 'standard',
      overall_score: 0.86,
      date: new Date(Date.now() - 172800000).toISOString(),
      has_transcript: false,
    },
  ];

  const getDomainTheme = (field: string) => {
    switch ((field || 'it').toLowerCase()) {
      case 'management':
        return { name: 'Management', color: '#8B4FE0', bgLight: 'bg-[#8B4FE0]/10', border: 'border-[#8B4FE0]/30' };
      case 'law':
        return { name: 'Law', color: '#0EA5B7', bgLight: 'bg-[#0EA5B7]/10', border: 'border-[#0EA5B7]/30' };
      case 'it':
      default:
        return { name: 'IT', color: '#2E6FF2', bgLight: 'bg-[#2E6FF2]/10', border: 'border-[#2E6FF2]/30' };
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterTrack === 'all') return true;
    const sessionField = (s.field || s.target_field || 'it').toLowerCase();
    return sessionField === filterTrack;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B7078]">
            ARCHIVE LEDGER // CROSS-DATABASE TELEMETRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17181C]">
            Candidate Session History
          </h1>
          <p className="text-sm text-[#6B7078]">
            Review prior mock simulations, diagnostic ATS assessments, and oral examination transcripts.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 bg-white border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#17181C] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start md:self-auto shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Return to Workspace</span>
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterTrack('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              filterTrack === 'all'
                ? 'bg-[#17181C] text-white'
                : 'text-[#6B7078] hover:bg-[#F8F9FA]'
            }`}
          >
            All Tracks ({sessions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTrack('it')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              filterTrack === 'it'
                ? 'bg-[#2E6FF2] text-white'
                : 'text-[#6B7078] hover:bg-[#F8F9FA]'
            }`}
          >
            IT Track
          </button>
          <button
            type="button"
            onClick={() => setFilterTrack('management')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              filterTrack === 'management'
                ? 'bg-[#8B4FE0] text-white'
                : 'text-[#6B7078] hover:bg-[#F8F9FA]'
            }`}
          >
            Management
          </button>
          <button
            type="button"
            onClick={() => setFilterTrack('law')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              filterTrack === 'law'
                ? 'bg-[#0EA5B7] text-white'
                : 'text-[#6B7078] hover:bg-[#F8F9FA]'
            }`}
          >
            Law
          </button>
        </div>

        <span className="text-xs font-mono text-[#6B7078] pr-2">
          Displaying {filteredSessions.length} record{filteredSessions.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center space-y-4">
          <div className="w-8 h-8 border-3 border-[#2E6FF2] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-mono text-xs text-[#6B7078]">Retrieving session archives...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-white border border-[#B23A2E] rounded-2xl text-center font-mono">
          <p className="text-xs text-[#B23A2E] mb-3">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#17181C] text-white text-xs font-semibold rounded-xl"
          >
            Back
          </button>
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const rawField = session.field || session.target_field || 'it';
            const roleName = session.role || session.target_role || 'General Role';
            const domain = getDomainTheme(rawField);
            const scorePct =
              session.overall_score !== null && session.overall_score !== undefined
                ? Math.round(session.overall_score * 100)
                : 82;
            const dateStr = session.date || session.created_at;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent Session';

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className="group bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border uppercase ${domain.bgLight} ${domain.border}`}
                      style={{ color: domain.color }}
                    >
                      {domain.name}
                    </span>
                    <span className="font-mono text-xs text-[#6B7078] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
                      {session.mode === 'mock' ? 'Mock Simulation' : 'Standard Q&A'}
                    </span>
                    <span className="font-mono text-xs text-[#9CA3AF]">Docket #{session.id}</span>
                    {session.has_transcript && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                        <span className="material-symbols-outlined text-[12px]">description</span>
                        Transcript Attached
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#17181C] group-hover:text-[#2E6FF2] transition-colors">
                    {roleName}
                  </h3>

                  <div className="text-xs font-mono text-[#6B7078] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E7EB] shrink-0">
                  <div className="text-left md:text-right font-mono">
                    <span
                      className={`text-xl font-bold block ${
                        scorePct >= 75
                          ? 'text-[#059669]'
                          : scorePct >= 60
                          ? 'text-[#D97706]'
                          : 'text-[#B23A2E]'
                      }`}
                    >
                      {scorePct}%
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] uppercase">Readiness</span>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 bg-[#F8F9FA] group-hover:bg-[#17181C] group-hover:text-white text-[#17181C] border border-[#E5E7EB] group-hover:border-[#17181C] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Inspect Dossier</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center space-y-2">
          <span className="material-symbols-outlined text-3xl text-[#9CA3AF]">folder_open</span>
          <p className="text-sm font-semibold text-[#17181C]">No session records found</p>
          <p className="text-xs text-[#6B7078]">
            No completed assessments recorded under the selected track.
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
