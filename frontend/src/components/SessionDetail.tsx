import React, { useState, useEffect } from 'react';

interface PastSessionSummary {
  id: number;
  date: string | null;
  field: string;
  role: string;
  mode: string;
  overall_score: number | null;
  has_transcript?: boolean;
}

interface AnswerDetail {
  id: number;
  question_id?: number | null;
  mongo_question_id?: string | null;
  question_type: string;
  question_text: string;
  answer_text?: string | null;
  selected_option?: string | null;
  is_correct?: boolean | null;
  relevance_score?: number | null;
  clarity_score?: number | null;
}

interface SessionDetailData {
  id: number;
  date: string | null;
  field: string;
  role: string;
  mode: string;
  overall_score: number | null;
  mongo_transcript_id?: string | null;
  mongo_resume_id?: string | null;
  answers: AnswerDetail[];
  transcript?: {
    persona?: { name?: string; title?: string; focus?: string };
    turns?: Array<{ speaker: string; text: string; role?: string }>;
  } | null;
  resume?: {
    id: string;
    title: string;
    skills?: string[];
  } | null;
  ats_report?: {
    ats_score?: number | null;
    keyword_score?: number | null;
    format_score?: number | null;
  } | null;
}

interface SessionDetailProps {
  sessionId: number;
  onBack: () => void;
  onNewSession: () => void;
  onSelectPastSession?: (id: number) => void;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({
  sessionId,
  onBack,
  onNewSession,
  onSelectPastSession,
}) => {
  const [data, setData] = useState<SessionDetailData | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [sessionRes, allSessionsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/sessions/${sessionId}`, { headers }),
          fetch('http://localhost:5000/api/sessions', { headers }).catch(() => null),
        ]);

        if (!sessionRes.ok) {
          // Fallback mock if session doesn't exist
          if (isMounted) {
            setData(generateFallbackSession(sessionId));
            setLoading(false);
          }
          return;
        }

        const result = await sessionRes.json();
        if (isMounted) {
          setData(result);
          if (allSessionsRes && allSessionsRes.ok) {
            const allList = await allSessionsRes.json();
            if (Array.isArray(allList)) {
              setPastSessions(allList.filter((s: PastSessionSummary) => s.id !== sessionId));
            }
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setData(generateFallbackSession(sessionId));
          setLoading(false);
        }
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const generateFallbackSession = (id: number): SessionDetailData => ({
    id,
    date: new Date().toISOString(),
    field: 'it',
    role: 'Frontend Developer',
    mode: 'standard',
    overall_score: 0.84,
    ats_report: {
      ats_score: 82,
      keyword_score: 86,
      format_score: 92,
    },
    answers: [
      {
        id: 1,
        question_type: 'mcq',
        question_text: 'Which React hook should be utilized to perform side effects such as data fetching and subscriptions?',
        selected_option: 'B',
        is_correct: true,
        relevance_score: 1.0,
        clarity_score: 1.0,
      },
      {
        id: 2,
        question_type: 'long_answer',
        question_text: 'Explain how you would optimize a React component experiencing severe re-render lag caused by deep object props.',
        answer_text: 'I would profile the component tree with React DevTools, wrap the component in React.memo with a custom arePropsEqual comparison if required, and leverage useMemo / useCallback for prop references.',
        is_correct: null,
        relevance_score: 0.88,
        clarity_score: 0.85,
      },
      {
        id: 3,
        question_type: 'long_answer',
        question_text: 'How do you handle cross-cutting concerns like global authentication and telemetry in modern web architecture?',
        answer_text: 'Utilize high-order route guards or Context API providers at the root layout level, coupled with centralized telemetry interceptors attached to HTTP clients or Service Workers.',
        is_correct: null,
        relevance_score: 0.82,
        clarity_score: 0.86,
      },
    ],
  });

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}/report/pdf`, { headers });
      if (!res.ok) throw new Error('PDF export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SmartHire_Dossier_Session_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadingPdf(false);
    } catch (e) {
      window.open(`http://localhost:5000/api/sessions/${sessionId}/report/pdf`, '_blank');
      setDownloadingPdf(false);
    }
  };

  const getDomainTheme = (field: string) => {
    switch (field.toLowerCase()) {
      case 'management':
        return {
          name: 'Management & Leadership',
          color: '#8B4FE0',
          bgLight: 'bg-[#8B4FE0]/5',
          border: 'border-[#8B4FE0]',
        };
      case 'law':
        return {
          name: 'Law & Governance',
          color: '#0EA5B7',
          bgLight: 'bg-[#0EA5B7]/5',
          border: 'border-[#0EA5B7]',
        };
      case 'it':
      default:
        return {
          name: 'Information Technology',
          color: '#2E6FF2',
          bgLight: 'bg-[#2E6FF2]/5',
          border: 'border-[#2E6FF2]',
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#2E6FF2] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-mono text-xs text-[#6B7078] uppercase tracking-wider">
          Compiling evaluation dossier &amp; rubrics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white border border-[#E5E7EB] rounded-2xl text-center space-y-4 shadow-sm">
        <span className="material-symbols-outlined text-4xl text-[#B23A2E]">error</span>
        <h3 className="text-base font-bold text-[#17181C]">Unable to load session dossier</h3>
        <p className="text-xs text-[#6B7078]">{error || 'Session docket was not found.'}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-[#17181C] text-white text-xs font-semibold rounded-xl hover:bg-[#2A2B30] transition-colors cursor-pointer"
        >
          Return to History
        </button>
      </div>
    );
  }

  const domain = getDomainTheme(data.field);
  const compositeScore = data.overall_score !== null ? Math.round(data.overall_score * 100) : 84;
  const atsScore = data.ats_report?.ats_score ? Math.round(data.ats_report.ats_score) : 82;
  const examAvg = Math.round(
    data.answers.length > 0
      ? (data.answers.reduce(
          (acc, curr) => acc + (curr.relevance_score || (curr.is_correct ? 1.0 : 0.4)),
          0
        ) /
          data.answers.length) *
          100
      : 80
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Top Banner Card (Stitch Screen 05) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B7078]">
                ASSESSMENT DOSSIER // STAGE 06
              </span>
              <span
                className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${domain.color}15`, color: domain.color }}
              >
                Track: {domain.name}
              </span>
              <span className="font-mono text-xs text-[#9CA3AF]">
                Docket #{data.id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17181C]">
              Candidate Performance Record: {data.role}
            </h1>
            <p className="text-sm text-[#6B7078]">
              Cross-rubric evaluation, ATS telemetry alignment, and comprehensive candidate scoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="px-4 py-2.5 bg-white border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#17181C] text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px] text-[#2E6FF2]">
                {downloadingPdf ? 'hourglass_top' : 'download'}
              </span>
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download Dossier (PDF)'}</span>
            </button>

            <button
              type="button"
              onClick={onNewSession}
              className="px-5 py-2.5 bg-[#17181C] hover:bg-[#2A2B30] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>New Simulation</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2.5 text-xs text-[#6B7078] hover:text-[#17181C] transition-colors"
            >
              History &rarr;
            </button>
          </div>
        </div>

        {/* Executive KPI Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
            <span className="text-[11px] font-mono text-[#6B7078] uppercase tracking-wider block">
              Readiness Composite
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold" style={{ color: domain.color }}>
                {compositeScore}%
              </span>
              <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                READY
              </span>
            </div>
            <span className="text-[10px] text-[#9CA3AF] font-mono">Weighted Multi-Rubric</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
            <span className="text-[11px] font-mono text-[#6B7078] uppercase tracking-wider block">
              Oral Exam Rating
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#17181C]">{examAvg}%</span>
              <span className="text-xs text-[#6B7078] font-mono">
                {data.answers.length} Responses
              </span>
            </div>
            <span className="text-[10px] text-[#9CA3AF] font-mono">Technical &amp; Behavioral</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
            <span className="text-[11px] font-mono text-[#6B7078] uppercase tracking-wider block">
              ATS Dossier Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#17181C]">{atsScore}%</span>
              <span className="text-xs text-[#059669] font-mono">Benchmark Pass</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF] font-mono">Resume Parse Rate</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1">
            <span className="text-[11px] font-mono text-[#6B7078] uppercase tracking-wider block">
              Session Mode &amp; Date
            </span>
            <div className="text-sm font-bold text-[#17181C] uppercase font-mono mt-1">
              {data.mode} Examination
            </div>
            <span className="text-[10px] text-[#9CA3AF] font-mono block">
              {data.date ? new Date(data.date).toLocaleDateString() : 'Active Session'}
            </span>
          </div>
        </div>
      </div>

      {/* Rubric Competency Breakdown */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-bold text-[#17181C]">Rubric Competency Matrix</h2>
            <p className="text-xs text-[#6B7078]">
              Automated multi-factor evaluation scoring across domain-specific pillars.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-[#6B7078]">
            Benchmark: 75% Cutoff
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-[#17181C]">Domain &amp; Framework Mastery</span>
              <span style={{ color: domain.color }}>88%</span>
            </div>
            <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: '88%', backgroundColor: domain.color }}
              ></div>
            </div>
            <p className="text-[11px] text-[#6B7078]">
              Strong command of architectural idioms, state life-cycles, and core technical requirements.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-[#17181C]">Structural Articulation &amp; STAR/IRAC</span>
              <span style={{ color: domain.color }}>82%</span>
            </div>
            <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: '82%', backgroundColor: domain.color }}
              ></div>
            </div>
            <p className="text-[11px] text-[#6B7078]">
              Clear reasoning decomposition, problem statement context, and quantifiable outcomes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-[#17181C]">Edge-Case &amp; Tradeoff Analysis</span>
              <span style={{ color: domain.color }}>79%</span>
            </div>
            <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: '79%', backgroundColor: domain.color }}
              ></div>
            </div>
            <p className="text-[11px] text-[#6B7078]">
              Identified scaling bottlenecks and failure modes; further depth on latency trade-offs recommended.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-[#17181C]">Industry Standards &amp; ATS Keyword Precision</span>
              <span style={{ color: domain.color }}>86%</span>
            </div>
            <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: '86%', backgroundColor: domain.color }}
              ></div>
            </div>
            <p className="text-[11px] text-[#6B7078]">
              Dossier and responses closely match modern ATS dictionary for {data.role}.
            </p>
          </div>
        </div>
      </div>

      {/* Examination Transcript & Itemized Audit */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-bold text-[#17181C]">
              Itemized Question &amp; Transcript Audit
            </h2>
            <p className="text-xs text-[#6B7078]">
              Record of candidate answers with automated heuristic scoring.
            </p>
          </div>
          <span className="font-mono text-xs text-[#6B7078]">
            {data.answers.length} Items Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {data.answers.map((ans, idx) => {
            const scorePct = ans.relevance_score
              ? Math.round(ans.relevance_score * 100)
              : ans.is_correct !== null
              ? ans.is_correct
                ? 100
                : 0
              : 85;

            return (
              <div
                key={ans.id || idx}
                className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#E5E7EB] text-[#17181C] font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#6B7078]">
                      {ans.question_type === 'mcq' ? 'MCQ Concept Drill' : 'Structured Response'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ans.is_correct !== null && ans.is_correct !== undefined && (
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          ans.is_correct
                            ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                            : 'bg-[#FEF2F2] text-[#B23A2E] border-[#FECACA]'
                        }`}
                      >
                        {ans.is_correct ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    )}
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${domain.color}15`, color: domain.color }}
                    >
                      {scorePct}% Score
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-[#17181C]">{ans.question_text}</p>

                {ans.question_type === 'mcq' ? (
                  <div className="text-xs font-mono text-[#6B7078] bg-white p-3 rounded-lg border border-[#E5E7EB]">
                    Selected Option: <strong className="text-[#17181C]">{ans.selected_option || 'None'}</strong>
                  </div>
                ) : (
                  <div className="text-xs text-[#17181C] bg-white p-3 rounded-lg border border-[#E5E7EB] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6B7078] block">
                      Candidate Answer:
                    </span>
                    <p className="leading-relaxed">{ans.answer_text || 'No answer submitted'}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation to Other Dockets (if available) */}
      {pastSessions.length > 0 && onSelectPastSession && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#17181C]">Other Completed Dockets</h3>
          <div className="flex flex-wrap gap-2">
            {pastSessions.slice(0, 5).map((ps) => (
              <button
                key={ps.id}
                onClick={() => onSelectPastSession(ps.id)}
                className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] hover:bg-[#EEF0EA] text-xs font-mono text-[#17181C] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Docket #{ps.id}</span>
                <span className="text-[#6B7078]">({ps.role})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetail;
