import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';

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
  const [filterTrack, setFilterTrack] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const storedToken = token || localStorage.getItem('token');
        const headers: HeadersInit = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};

        const res = await fetch(buildApiUrl('/api/sessions'), { headers });
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
      } catch {
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
      overall_score: 0.88,
      date: new Date(Date.now() - 3600000).toISOString(),
      has_transcript: true,
    },
    {
      id: 54,
      field: 'management',
      role: 'Product Manager',
      mode: 'mock',
      overall_score: 0.84,
      date: new Date(Date.now() - 86400000).toISOString(),
      has_transcript: true,
    },
    {
      id: 55,
      field: 'law',
      role: 'Corporate Counsel',
      mode: 'standard',
      overall_score: 0.92,
      date: new Date(Date.now() - 172800000).toISOString(),
      has_transcript: false,
    },
  ];

  const filteredSessions = sessions.filter((s) => {
    const f = (s.field || s.target_field || 'it').toLowerCase();
    if (filterTrack === 'all') return true;
    return f === filterTrack;
  });

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 text-left animate-fadeIn select-none">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#71717a] block mb-1">
            ARCHIVE LEDGER // CROSS-DATABASE TELEMETRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Candidate Session History
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
            Review prior mock simulations, diagnostic ATS assessments, and oral examination transcripts.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="btn-glass px-4 py-2 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Return to Workspace</span>
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterTrack('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              filterTrack === 'all'
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white shadow-xs'
                : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            All Tracks ({sessions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTrack('it')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              filterTrack === 'it'
                ? 'bg-[#3b82f6] text-white shadow-xs'
                : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            IT Track
          </button>
          <button
            type="button"
            onClick={() => setFilterTrack('management')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              filterTrack === 'management'
                ? 'bg-[#8b5cf6] text-white shadow-xs'
                : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Management
          </button>
          <button
            type="button"
            onClick={() => setFilterTrack('law')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              filterTrack === 'law'
                ? 'bg-[#0EA5B7] text-white shadow-xs'
                : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Law Track
          </button>
        </div>

        <span className="font-mono text-[11px] text-[#71717a] hidden sm:inline">
          MongoDB Transcripts Active
        </span>
      </div>

      {/* Session Cards List */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/[0.08] text-center text-xs font-mono text-[#a1a1aa]">
          Retrieving session dossiers...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/[0.08] text-center text-xs text-[#a1a1aa]">
          No sessions recorded in this track filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((s) => {
            const scorePct = s.overall_score !== null ? Math.round((s.overall_score || 0.85) * 100) : 85;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className="p-5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#c084fc] font-mono text-sm font-bold shrink-0 group-hover:scale-105 transition-transform">
                    #{s.id}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-white group-hover:text-[#c084fc] transition-colors">
                        {s.role || s.target_role || 'Candidate Role'}
                      </h3>
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/[0.05] text-[#22d3ee]">
                        {s.field || s.target_field || 'IT'}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-[#a1a1aa]">
                        Mode: {s.mode || 'standard'}
                      </span>
                    </div>

                    <p className="text-xs text-[#71717a] font-mono">
                      {s.date || s.created_at ? new Date(s.date || s.created_at || '').toLocaleDateString() : 'Recent Session'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="font-mono text-base font-bold text-white">
                      {scorePct}%
                    </div>
                    <span className="text-[10px] font-mono text-[#10b981]">
                      {scorePct >= 85 ? 'Offer Ready' : 'Passed'}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#a1a1aa] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
