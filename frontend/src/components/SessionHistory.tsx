import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SessionSummary {
  id: number;
  date: string;
  field?: string;
  role: string;
  mode?: 'standard' | 'mock';
  overall_score: number | null;
  has_transcript?: boolean;
}

interface SessionHistoryProps {
  onSelectSession: (sessionId: number) => void;
  onBack: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ onSelectSession, onBack }) => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch('http://localhost:5000/api/sessions', { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch sessions');
        setSessions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[960px] mx-auto p-12 bg-white border border-[#D2D5C9] rounded text-center">
        <LoadingSpinner message="Retrieving archived session dockets..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[960px] mx-auto p-8 bg-white border border-[#B23A2E] rounded text-center">
        <p className="text-sm text-[#B23A2E] mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2F6F4E] text-white text-xs font-medium rounded hover:bg-[#24583E] transition-colors cursor-pointer"
        >
          Return to Docket
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-score-mono text-[#5C6B60] uppercase tracking-wider">
          Archive Index // Historical Evaluations &amp; Dossiers
        </div>
        <button
          onClick={onBack}
          className="text-xs text-[#5C6B60] hover:text-[#1A2E22] transition-colors cursor-pointer"
        >
          &larr; Return to Active Docket
        </button>
      </div>

      <h1 className="text-3xl font-serif-heading font-medium text-[#1A2E22] tracking-tight mb-2">
        Preparation History &amp; Past Dockets
      </h1>
      <p className="text-sm text-[#5C6B60] mb-8 leading-relaxed">
        Review past interview transcripts, multi-field rubrics, and downloadable performance reports across standard and mock tracks.
      </p>

      {sessions.length > 0 ? (
        <div className="bg-white border border-[#D2D5C9] rounded divide-y divide-[#D2D5C9] shadow-sm overflow-hidden">
          {sessions.map((session) => {
            const scorePercent = session.overall_score !== null ? Math.round(session.overall_score * 100) : null;
            const fieldNormalized = (session.field || 'it').toLowerCase();
            const isMock = session.mode === 'mock';

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className="p-4 hover:bg-[#EEF0EA]/60 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded border border-[#D2D5C9] bg-[#EEF0EA] flex items-center justify-center text-[#2F6F4E] font-score-mono text-xs font-semibold">
                    #{String(session.id).padStart(3, '0')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[#1A2E22]">{session.role}</span>

                      {/* Field Track Badge */}
                      <span
                        className={`font-score-mono text-[10px] px-2 py-0.5 rounded border uppercase font-medium ${
                          fieldNormalized === 'it'
                            ? 'bg-[#F1F6F3] text-[#2F6F4E] border-[#C8E0CE]'
                            : fieldNormalized === 'management'
                            ? 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
                            : 'bg-[#F4F1FA] text-[#5C458A] border-[#D6CBE8]'
                        }`}
                      >
                        {fieldNormalized}
                      </span>

                      {/* Mode Badge */}
                      <span
                        className={`font-score-mono text-[10px] px-2 py-0.5 rounded border ${
                          isMock
                            ? 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]'
                            : 'bg-[#F7F8F5] text-[#5C6B60] border-[#D2D5C9]'
                        }`}
                      >
                        {isMock ? 'Mock Interview' : 'Standard Q&A'}
                      </span>
                    </div>

                    <div className="text-xs font-score-mono text-[#5C6B60]">
                      {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {session.has_transcript && (
                        <span className="ml-2 text-[#2F6F4E] font-medium">· Transcript Attached</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {scorePercent !== null ? (
                    <span className="font-score-mono text-sm font-semibold text-[#2F6F4E] px-2.5 py-1 rounded bg-[#F1F6F3] border border-[#C8E0CE]">
                      {scorePercent}%
                    </span>
                  ) : (
                    <span className="font-score-mono text-xs text-[#5C6B60] bg-[#EEF0EA] px-2 py-0.5 rounded">
                      Incomplete
                    </span>
                  )}
                  <span className="text-[#5C6B60] text-sm">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#D2D5C9] rounded p-10 text-center text-[#5C6B60] text-sm">
          No archived sessions recorded yet. Start your first practice session from the candidate intake docket!
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
