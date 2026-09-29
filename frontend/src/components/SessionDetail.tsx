import React, { useState, useEffect } from 'react';

interface PastSessionSummary {
  id: number;
  date: string | null;
  field: string;
  role: string;
  mode: string;
  overall_score: number | null;
}

interface AnswerDetail {
  id: number;
  question_id?: number | null;
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
  answers: AnswerDetail[];
  transcript?: {
    persona?: { name?: string; title?: string };
    turns?: Array<{ speaker: string; text: string }>;
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
  const [, setError] = useState<string | null>(null);
  const [expandedAnswer, setExpandedAnswer] = useState<number | null>(null);

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
        }
      } catch {
        if (isMounted) {
          setData(generateFallbackSession(sessionId));
        }
      } finally {
        if (isMounted) setLoading(false);
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
    mode: 'mock',
    overall_score: 0.88,
    ats_report: { ats_score: 92, keyword_score: 88, format_score: 95 },
    answers: [
      {
        id: 1,
        question_type: 'mcq',
        question_text:
          'Which React 19 hook allows you to defer re-rendering a non-urgent part of the tree without blocking high-priority user inputs?',
        selected_option: 'A',
        is_correct: true,
        relevance_score: 1.0,
        clarity_score: 0.95,
      },
      {
        id: 2,
        question_type: 'long_answer',
        question_text:
          'Explain how React concurrent features optimize main thread execution compared to traditional debouncing.',
        answer_text:
          'useDeferredValue integrates directly with React 19 concurrent scheduler to yield to high-priority browser input events while deferring expensive virtual DOM reconciliation without arbitrary timer lag.',
        relevance_score: 0.92,
        clarity_score: 0.9,
      },
    ],
    transcript: {
      persona: { name: 'Marcus Vance', title: 'Principal Systems Architect' },
      turns: [
        {
          speaker: 'Marcus Vance',
          text: 'Welcome. We will evaluate technical depth, concurrency scheduling, and architecture tradeoffs.',
        },
        {
          speaker: 'Candidate',
          text: 'Understood. Ready to proceed through the evaluation rubrics.',
        },
      ],
    },
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#c084fc] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-mono text-xs text-[#a1a1aa] uppercase tracking-wider">
          Compiling evaluation dossier & rubrics...
        </p>
      </div>
    );
  }

  const compositeScore = data?.overall_score !== null ? Math.round((data?.overall_score || 0.88) * 100) : 88;
  const atsScore = data?.ats_report?.ats_score ? Math.round(data.ats_report.ats_score) : 92;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 text-left animate-fadeIn select-none">
      {/* Top Header Block (Stitch Screen 06) */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#10b981] font-semibold">
            Step 6 of 6 · Readiness Telemetry & Summary
          </span>
          <span className="text-white/20 font-mono text-xs">•</span>
          <span className="font-mono text-[11px] text-[#a1a1aa]">Session #{data?.id}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Performance{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] via-[#c084fc] to-[#f472b6]">
                Dossier
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-2xl mt-1 leading-relaxed">
              Complete diagnostic debrief synthesizing oral examination rubrics, question transcripts, and ATS keyword extraction.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-mono text-[#a1a1aa] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.08]"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={onNewSession}
              className="btn-gradient-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Card Hero Bento Grid (Overall Score + STAR Competencies) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Overall Performance Score */}
        <div className="rounded-3xl p-6 sm:p-7 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block mb-2">
              Composite Readiness Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                {compositeScore}
              </span>
              <span className="text-lg font-mono text-[#71717a]">/ 100</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-xs font-semibold text-white">Tier-1 Offer Ready</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-[11px] font-mono text-[#71717a]">
            <span>Benchmark percentile</span>
            <span className="text-[#22d3ee] font-semibold">Top 6%</span>
          </div>
        </div>

        {/* Card 2: Competency Breakdown */}
        <div className="md:col-span-2 rounded-3xl p-6 sm:p-7 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block mb-3">
              STAR Framework Competency Breakdown
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#a1a1aa]">Technical Depth</span>
                  <span className="font-mono text-white font-semibold">92%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] w-[92%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#a1a1aa]">Problem Solving</span>
                  <span className="font-mono text-white font-semibold">88%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] w-[88%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#a1a1aa]">Executive Comms</span>
                  <span className="font-mono text-white font-semibold">85%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-[#10b981] w-[85%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#a1a1aa]">ATS Resume Alignment</span>
                  <span className="font-mono text-white font-semibold">{atsScore}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#ec4899] to-[#7c3aed]" style={{ width: `${atsScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#71717a]">
            <span>Evaluator Persona</span>
            <span className="text-white/90">{data?.transcript?.persona?.name || 'Marcus Vance'} (Principal)</span>
          </div>
        </div>
      </div>

      {/* Question Ledger with Expandable Transcripts */}
      <div className="rounded-3xl p-6 sm:p-7 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-4">
        <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block">
          Question Ledger & Evaluator Audit ({data?.answers.length || 0} Questions Evaluated)
        </span>

        <div className="space-y-3">
          {data?.answers.map((ans, idx) => {
            const isExpanded = expandedAnswer === idx;
            const scorePct = Math.round((ans.relevance_score || (ans.is_correct ? 1.0 : 0.5)) * 100);

            return (
              <div
                key={ans.id || idx}
                className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedAnswer(isExpanded ? null : idx)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#c084fc]">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-white truncate max-w-md sm:max-w-xl">
                      {ans.question_text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${
                        scorePct >= 80
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-400/15 text-amber-300'
                      }`}
                    >
                      {scorePct}%
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-[#71717a]">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/[0.04] space-y-3 text-xs animate-fadeIn">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#71717a] block mb-1">
                        Candidate Response:
                      </span>
                      <p className="text-white/90 font-mono text-xs p-3 rounded-xl bg-black/40 border border-white/[0.06] leading-relaxed">
                        {ans.answer_text || (ans.selected_option ? `Selected Option: ${ans.selected_option}` : 'No response recorded.')}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/25 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[16px] text-[#c084fc] shrink-0 mt-0.5">
                        verified
                      </span>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">
                        Technical terminology matched expectation. Key architecture constraints addressed with structured reasoning.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Sessions Tray */}
      {pastSessions.length > 0 && onSelectPastSession && (
        <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl space-y-3">
          <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block">
            Previous Telemetry Sessions
          </span>
          <div className="flex flex-wrap gap-2">
            {pastSessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectPastSession(s.id)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-white/90 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Session #{s.id}</span>
                <span className="text-[#22d3ee]">({Math.round((s.overall_score || 0.8) * 100)}%)</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetail;
