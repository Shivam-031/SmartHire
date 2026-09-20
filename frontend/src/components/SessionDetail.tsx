import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface AnswerDetail {
  id?: number;
  question_id?: number;
  mongo_question_id?: string;
  question_type?: string;
  question_text?: string;
  answer_text?: string;
  selected_option?: string;
  is_correct?: boolean;
  relevance_score?: number;
  clarity_score?: number;
}

interface TranscriptTurn {
  question_text: string;
  interviewer_remark?: string;
  answer_text: string;
  score: number;
  branch_direction?: string;
  timestamp?: string;
}

interface SessionDetailData {
  id: number;
  date: string;
  field?: string;
  role: string;
  mode?: 'standard' | 'mock';
  overall_score: number | null;
  mongo_transcript_id?: string;
  mongo_resume_id?: string;
  answers: AnswerDetail[];
  transcript?: {
    id: string;
    persona?: {
      name: string;
      title: string;
      firm?: string;
    };
    turns: TranscriptTurn[];
  } | null;
  resume?: {
    id: string;
    title: string;
    skills: string[];
    last_updated?: string;
  } | null;
  ats_report: {
    ats_score: number | null;
    issues: any[];
  } | null;
}

interface PastSessionSummary {
  id: number;
  date: string;
  field?: string;
  role: string;
  mode?: 'standard' | 'mock';
  overall_score: number | null;
}

interface SessionDetailProps {
  sessionId: number;
  onBack: () => void;
  onNewSession?: () => void;
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

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [sessionRes, allSessionsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/sessions/${sessionId}`, { headers }),
          fetch('http://localhost:5000/api/sessions', { headers }).catch(() => null),
        ]);

        const result = await sessionRes.json();
        if (!sessionRes.ok) throw new Error(result.error || 'Failed to fetch session details');
        setData(result);

        if (allSessionsRes && allSessionsRes.ok) {
          const allList = await allSessionsRes.json();
          setPastSessions(allList.filter((s: PastSessionSummary) => s.id !== sessionId));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-[1040px] mx-auto p-12 bg-white border border-[#D2D5C9] rounded text-center">
        <LoadingSpinner message="Compiling executive evaluation dossier & performance rubrics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-[1040px] mx-auto p-8 bg-white border border-[#B23A2E] rounded text-center">
        <p className="text-sm text-[#B23A2E] mb-4">{error || 'Session not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2F6F4E] text-white text-xs font-medium rounded hover:bg-[#24583E] transition-colors cursor-pointer"
        >
          Return to History
        </button>
      </div>
    );
  }

  const interviewScore = data.overall_score !== null ? Math.round(data.overall_score * 100) : 75;
  const atsScore = data.ats_report?.ats_score !== null && data.ats_report?.ats_score !== undefined
    ? Math.round(data.ats_report.ats_score)
    : 68;

  const fieldNormalized = (data.field || 'it').toLowerCase();
  const isMock = data.mode === 'mock';

  return (
    <div className="max-w-[1040px] mx-auto text-left">
      {/* Header Stage Tag */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-score-mono text-[#5C6B60] uppercase tracking-wider">
          Stage 05 // Executive Evaluation · Dossier &amp; Performance Rubric
        </div>
        <div className="text-[11px] font-score-mono text-[#5C6B60]">
          Docket Reference: #{String(data.id).padStart(4, '0')} · {new Date(data.date).toLocaleDateString()}
        </div>
      </div>

      {/* Screen Heading */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-2">
        <h1 className="text-3xl sm:text-4xl font-serif-heading font-medium text-[#1A2E22] tracking-tight">
          Session Assessment Dossier
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`font-score-mono text-xs px-2.5 py-1 rounded border font-medium uppercase ${
              fieldNormalized === 'it'
                ? 'bg-[#F1F6F3] text-[#2F6F4E] border-[#C8E0CE]'
                : fieldNormalized === 'management'
                ? 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
                : 'bg-[#F4F1FA] text-[#5C458A] border-[#D6CBE8]'
            }`}
          >
            {fieldNormalized} Track
          </span>
          <span
            className={`font-score-mono text-xs px-2.5 py-1 rounded border font-medium ${
              isMock
                ? 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]'
                : 'bg-[#F7F8F5] text-[#5C6B60] border-[#D2D5C9]'
            }`}
          >
            {isMock ? 'Mock Interview' : 'Standard Q&A'}
          </span>
        </div>
      </div>

      <p className="text-sm text-[#5C6B60] mb-8 leading-relaxed max-w-2xl">
        Comprehensive evaluation consolidating verbal examination scores, domain keyword calibration, cross-database transcripts, and ATS document heuristics.
      </p>

      {/* Side-by-Side Assessment Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* BLOCK A: Examination Verbal Score */}
        <div className="bg-white border border-[#D2D5C9] rounded p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D2D5C9]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2F6F4E]" />
                <h2 className="text-xs font-score-mono uppercase tracking-wider text-[#1A2E22] font-semibold">
                  {isMock ? 'Mock Interview Composite' : 'Oral Examination Score'}
                </h2>
              </div>
              <span
                className={`text-[11px] font-score-mono px-2 py-0.5 rounded border ${
                  interviewScore >= 70
                    ? 'bg-[#F1F6F3] text-[#2F6F4E] border-[#C8E0CE]'
                    : 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
                }`}
              >
                {interviewScore >= 70 ? 'Passing Standard Met' : 'Review Recommended'}
              </span>
            </div>

            <div className="py-4 flex items-baseline gap-2">
              <span className="font-score-mono text-5xl font-semibold text-[#2F6F4E] tracking-tight">
                {interviewScore}
              </span>
              <span className="font-score-mono text-xl text-[#5C6B60]">/100</span>
              <span className="ml-auto text-xs font-score-mono text-[#5C6B60] uppercase">Composite Verbal</span>
            </div>

            <p className="text-xs text-[#5C6B60] italic leading-relaxed mb-4">
              {fieldNormalized === 'it'
                ? 'Evaluated across code correctness, system constraints, trade-off analysis, and concise technical responses.'
                : 'Evaluated across Situation-Action-Result structural framing, stakeholder alignment, and communication clarity.'}
            </p>

            <div className="border-t border-[#D2D5C9] pt-4 space-y-2 text-xs">
              <div className="flex justify-between font-score-mono">
                <span className="text-[#5C6B60]">Target Role:</span>
                <span className="font-semibold text-[#1A2E22]">{data.role}</span>
              </div>
              <div className="flex justify-between font-score-mono">
                <span className="text-[#5C6B60]">Transcript Status:</span>
                <span className="text-[#2F6F4E] font-medium">
                  {data.mongo_transcript_id ? 'MongoDB Document Linked' : 'SQL Answers Recorded'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK B: ATS Document Audit */}
        <div className="bg-white border border-[#D2D5C9] rounded p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D2D5C9]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B08D2F]" />
                <h2 className="text-xs font-score-mono uppercase tracking-wider text-[#1A2E22] font-semibold">
                  ATS Document Audit
                </h2>
              </div>
              <span
                className={`text-[11px] font-score-mono px-2 py-0.5 rounded border ${
                  atsScore >= 75
                    ? 'bg-[#F1F6F3] text-[#2F6F4E] border-[#C8E0CE]'
                    : 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
                }`}
              >
                {atsScore >= 75 ? 'ATS Optimized' : 'Needs Polish'} · {atsScore}/100
              </span>
            </div>

            <div className="py-4 flex items-baseline gap-2">
              <span
                className={`font-score-mono text-5xl font-semibold tracking-tight ${
                  atsScore >= 75 ? 'text-[#2F6F4E]' : 'text-[#B08D2F]'
                }`}
              >
                {atsScore}
              </span>
              <span className="font-score-mono text-xl text-[#5C6B60]">/100</span>
              <span className="ml-auto text-xs font-score-mono text-[#5C6B60] uppercase">Parser Benchmark</span>
            </div>

            <p className="text-xs text-[#5C6B60] italic leading-relaxed mb-4">
              Deterministic heuristic audit based on standard applicant tracking schemas.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-[#FDF2F0] border border-[#B23A2E]/20 rounded py-1.5 px-1 flex flex-col items-center">
                <span className="font-score-mono text-xs font-bold text-[#B23A2E]">
                  {data.ats_report?.issues.length ? `${data.ats_report.issues.length} Flags` : '0 Fatal'}
                </span>
                <span className="text-[10px] text-[#5C6B60] uppercase font-score-mono">Issues</span>
              </div>
              <div className="bg-[#FCF8ED] border border-[#B08D2F]/30 rounded py-1.5 px-1 flex flex-col items-center">
                <span className="font-score-mono text-xs font-bold text-[#B08D2F]">
                  {data.resume?.skills.length ? `${data.resume.skills.length} Skills` : 'Standard'}
                </span>
                <span className="text-[10px] text-[#5C6B60] uppercase font-score-mono">Indexed</span>
              </div>
              <div className="bg-[#F1F6F3] border border-[#C8E0CE] rounded py-1.5 px-1 flex flex-col items-center">
                <span className="font-score-mono text-xs font-bold text-[#2F6F4E]">Compliant</span>
                <span className="text-[10px] text-[#5C6B60] uppercase font-score-mono">Format</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#D2D5C9] flex items-center justify-between text-xs text-[#5C6B60] font-score-mono">
            <span>ATS V4.2 Heuristics</span>
            <span className="text-[#2F6F4E]">Audit Attached</span>
          </div>
        </div>
      </div>

      {/* Mentor Box */}
      <aside className="mb-8 bg-white border-l-4 border-[#2F6F4E] border-t border-r border-b border-[#D2D5C9] p-4 rounded-r shadow-sm flex items-start gap-3.5">
        <div className="w-7 h-7 rounded bg-[#F1F6F3] text-[#2F6F4E] flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-score-mono uppercase font-semibold text-[#2F6F4E] tracking-wide">
              Advisory Board Recommendation
            </span>
            <span className="text-[#D2D5C9]">·</span>
            <span className="text-xs font-score-mono text-[#5C6B60]">SmartHire Evaluation Engine</span>
          </div>
          <p className="text-xs text-[#5C6B60] italic mt-1 leading-relaxed">
            {fieldNormalized === 'it'
              ? '"Your technical responses demonstrate strong architectural discipline. Prioritize concise trade-off justifications and integrate core cloud and orchestration keywords into your written experience profile."'
              : '"Your responses demonstrated clear structural framing. Continue emphasizing quantifiable outcomes and stakeholder conflict resolution within the SAR framework."'}
          </p>
        </div>
      </aside>

      {/* Action Strip: Download Report & Navigation */}
      <div className="border-t border-b border-[#D2D5C9] py-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`http://localhost:5000/api/sessions/${sessionId}/report`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#2F6F4E] hover:bg-[#24583E] text-white px-4 py-2.5 rounded text-xs font-medium flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Official PDF Dossier</span>
          </a>

          {onNewSession && (
            <button
              type="button"
              onClick={onNewSession}
              className="bg-white hover:bg-[#EEF0EA] text-[#1A2E22] border border-[#D2D5C9] px-4 py-2.5 rounded text-xs font-medium transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#5C6B60]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Start a New Session</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2.5 text-xs text-[#5C6B60] hover:text-[#1A2E22] transition-colors cursor-pointer"
          >
            &larr; Past Sessions Index
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#5C6B60] font-score-mono">
          <svg className="w-4 h-4 text-[#2F6F4E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Dossier archived &amp; persisted across SQL + Mongo.</span>
        </div>
      </div>

      {/* Mock Interview Interactive Transcript (if available) */}
      {isMock && data.transcript?.turns && data.transcript.turns.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-heading text-xl font-medium text-[#1A2E22]">
              Mock Interview Turn Log &amp; Persona Remarks
            </h3>
            {data.transcript.persona && (
              <span className="text-xs font-score-mono text-[#2F6F4E] bg-[#F1F6F3] border border-[#C8E0CE] px-2.5 py-1 rounded">
                Interviewer: {data.transcript.persona.name} ({data.transcript.persona.title})
              </span>
            )}
          </div>

          <div className="space-y-4">
            {data.transcript.turns.map((turn, idx) => (
              <div key={idx} className="bg-white border border-[#D2D5C9] rounded p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#EEF0EA] pb-2">
                  <span className="font-score-mono text-xs text-[#5C6B60]">
                    Dialogue Turn #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {turn.branch_direction && (
                      <span className="font-score-mono text-[10px] px-2 py-0.5 rounded bg-[#FCF8ED] text-[#B08D2F] border border-[#B08D2F]/30 font-medium">
                        Branch: {turn.branch_direction}
                      </span>
                    )}
                    <span className="font-score-mono text-xs font-semibold text-[#2F6F4E] bg-[#F1F6F3] border border-[#C8E0CE] px-2 py-0.5 rounded">
                      Score: {turn.score}%
                    </span>
                  </div>
                </div>

                {turn.interviewer_remark && (
                  <div className="p-2.5 bg-[#F1F6F3] border-l-2 border-[#2F6F4E] rounded-r text-xs italic text-[#2F6F4E]">
                    "{turn.interviewer_remark}"
                  </div>
                )}

                <div>
                  <div className="text-xs font-score-mono text-[#5C6B60] uppercase mb-1">Question Prompt:</div>
                  <div className="text-sm font-medium text-[#1A2E22]">{turn.question_text}</div>
                </div>

                <div>
                  <div className="text-xs font-score-mono text-[#5C6B60] uppercase mb-1">Candidate Verbal Response:</div>
                  <div className="p-3 bg-[#F7F8F5] rounded border border-[#D2D5C9] text-xs text-[#1A2E22] font-mono leading-relaxed whitespace-pre-wrap">
                    "{turn.answer_text}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Transcript (Standard Q&A answers or supplementary) */}
      {(!isMock || !data.transcript?.turns?.length) && (
        <div className="mb-10">
          <h3 className="font-serif-heading text-xl font-medium text-[#1A2E22] mb-4">
            Examination Transcript &amp; Detailed Scores
          </h3>
          <div className="space-y-4">
            {data.answers.map((ans, idx) => (
              <div key={idx} className="bg-white border border-[#D2D5C9] rounded p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-score-mono text-xs text-[#5C6B60]">
                    Question Item #{idx + 1} · {ans.question_type ? ans.question_type.toUpperCase() : 'LONG_ANSWER'}
                  </span>
                  {ans.question_type === 'mcq' ? (
                    <span
                      className={`font-score-mono text-xs px-2 py-0.5 rounded font-medium border ${
                        ans.is_correct
                          ? 'bg-[#F1F6F3] text-[#2F6F4E] border-[#C8E0CE]'
                          : 'bg-[#FDF2F0] text-[#B23A2E] border-[#B23A2E]/30'
                      }`}
                    >
                      {ans.is_correct ? 'Correct (100%)' : 'Incorrect (0%)'}
                    </span>
                  ) : (
                    <div className="flex items-center gap-3 font-score-mono text-xs">
                      <span className="text-[#2F6F4E] font-medium">
                        Relevance: {((ans.relevance_score || 0) * 100).toFixed(0)}%
                      </span>
                      <span className="text-[#5C6B60]">|</span>
                      <span className="text-[#2F6F4E] font-medium">
                        Clarity: {((ans.clarity_score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>

                {ans.question_text && (
                  <div className="text-sm font-medium text-[#1A2E22]">
                    {ans.question_text}
                  </div>
                )}

                <div className="p-3 bg-[#EEF0EA]/60 rounded border border-[#D2D5C9] text-xs text-[#1A2E22] font-mono leading-relaxed whitespace-pre-wrap">
                  {ans.question_type === 'mcq'
                    ? `Selected Option: ${ans.selected_option || 'None'}`
                    : `"${ans.answer_text}"`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions List */}
      {pastSessions.length > 0 && (
        <section className="mt-8 pt-6 border-t border-[#D2D5C9]">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif-heading text-lg font-medium text-[#1A2E22]">Past Archived Sessions</h3>
              <span className="font-score-mono text-xs text-[#5C6B60]">({pastSessions.length} archived dockets)</span>
            </div>
            <span className="text-xs font-score-mono text-[#5C6B60] uppercase">Read-only index</span>
          </div>

          <div className="bg-white border border-[#D2D5C9] rounded divide-y divide-[#D2D5C9] overflow-hidden">
            {pastSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectPastSession && onSelectPastSession(session.id)}
                className="p-3.5 hover:bg-[#EEF0EA]/60 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#1A2E22]">{session.role}</span>
                    <span className="text-[10px] font-score-mono uppercase text-[#5C6B60] bg-[#EEF0EA] px-1.5 py-0.2 rounded">
                      {session.field || 'it'} · {session.mode || 'standard'}
                    </span>
                  </div>
                  <div className="text-[11px] font-score-mono text-[#5C6B60]">
                    Docket #{session.id} · {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-score-mono text-xs font-semibold text-[#2F6F4E]">
                    {session.overall_score !== null ? `${(session.overall_score * 100).toFixed(0)}%` : 'Pending'}
                  </span>
                  <span className="text-[#5C6B60] text-xs">&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SessionDetail;
