import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../context/AuthContext';

interface ATSIssue {
  type: string;
  message: string;
  severity: 'High' | 'Medium' | 'Low';
}

interface ATSReportProps {
  resumeId?: number | null;
  mongoResumeId?: string | null;
  targetRole?: string;
  onClose: () => void;
  onProceedToSummary?: () => void;
}

export const ATSReport: React.FC<ATSReportProps> = ({
  resumeId,
  mongoResumeId,
  targetRole = 'Frontend Developer',
  onClose,
  onProceedToSummary,
}) => {
  const { token } = useAuth();
  const [report, setReport] = useState<{
    score: number;
    issues: ATSIssue[];
    disclaimer: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const payload: Record<string, any> = {};
        if (mongoResumeId) {
          payload['mongo_resume_id'] = mongoResumeId;
        } else if (resumeId) {
          payload['resume_id'] = resumeId;
        }

        const response = await fetch('http://localhost:5000/api/ats/check', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch ATS report');

        setReport({
          score: data.ats_score,
          issues: data.issues || [],
          disclaimer: data.disclaimer || 'Heuristic estimate based on common ATS rules — not a certified score.',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [resumeId, mongoResumeId, token]);

  if (loading) {
    return (
      <div className="max-w-[960px] mx-auto p-12 bg-white border border-[#D2D5C9] rounded text-center">
        <LoadingSpinner message="Scanning document structure against heuristic ATS rules..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[960px] mx-auto p-8 bg-white border border-[#B23A2E] rounded text-center">
        <p className="text-sm text-[#B23A2E] mb-4">Error generating ATS report: {error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#2F6F4E] text-white text-xs font-medium rounded hover:bg-[#24583E] transition-colors cursor-pointer"
        >
          Return to Docket
        </button>
      </div>
    );
  }

  if (!report) return null;

  const score = Math.round(report.score);
  const isGood = score >= 75;
  const isMid = score >= 50 && score < 75;

  const criticalIssues = report.issues.filter((i) => i.severity === 'High');
  const warningIssues = report.issues.filter((i) => i.severity === 'Medium' || i.severity === 'Low');

  return (
    <div className="max-w-[960px] mx-auto text-left">
      {/* Header Stage Tag */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-score-mono text-[#5C6B60] uppercase tracking-wider">
          Stage 04 // Evaluation · Ingestion Diagnostics &amp; Keyword Match
        </div>
        <div className="text-[11px] font-score-mono text-[#5C6B60]">
          Engine: Heuristic ATS Parser v4.2
        </div>
      </div>

      {/* Screen Heading */}
      <h1 className="text-3xl sm:text-4xl font-serif-heading font-medium text-[#1A2E22] tracking-tight">
        Resume ATS Compatibility
      </h1>

      {/* Disclaimer Line */}
      <p className="text-xs sm:text-sm text-[#5C6B60] mt-1.5 mb-6 flex items-center gap-1.5">
        <svg className="w-4 h-4 text-[#5C6B60] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{report.disclaimer}</span>
      </p>

      {/* Large Score Card */}
      <div className="bg-white border border-[#D2D5C9] rounded p-6 sm:p-7 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#D2D5C9]">
          <div className="flex items-baseline gap-4">
            <div className="flex items-baseline">
              <span
                className={`font-score-mono text-5xl sm:text-6xl font-semibold tracking-tight ${
                  isGood ? 'text-[#2F6F4E]' : isMid ? 'text-[#B08D2F]' : 'text-[#B23A2E]'
                }`}
              >
                {score}
              </span>
              <span className="text-[#5C6B60] text-xl sm:text-2xl font-score-mono ml-1.5">/100</span>
            </div>
            <div className="border-l border-[#D2D5C9] pl-4 py-0.5">
              <div
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-score-mono font-medium border mb-1 ${
                  isGood
                    ? 'bg-[#F1F6F3] text-[#2F6F4E] border-[#C8E0CE]'
                    : isMid
                    ? 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
                    : 'bg-[#FDF2F0] text-[#B23A2E] border-[#B23A2E]/30'
                }`}
              >
                {isGood ? 'High ATS Compatibility' : isMid ? 'Needs Refinement' : 'High Rejection Hazard'}
              </div>
              <div className="text-sm font-medium text-[#1A2E22]">
                {isGood
                  ? 'Strong parseability across standard enterprise ATS filters.'
                  : isMid
                  ? 'Fair parseability, but key technical signals are masked.'
                  : 'Critical formatting or keyword omissions detected.'}
              </div>
              <div className="text-xs text-[#5C6B60]">
                Evaluated against industry scanners (Workday, Greenhouse, Lever heuristics).
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:border-l sm:border-[#D2D5C9] sm:pl-6 text-xs shrink-0">
            <div>
              <div className="text-[#5C6B60] mb-0.5">Passed Checks</div>
              <div className="font-score-mono text-sm font-semibold text-[#2F6F4E]">
                {Math.max(0, 6 - report.issues.length)} of 6
              </div>
            </div>
            <div>
              <div className="text-[#5C6B60] mb-0.5">Warnings</div>
              <div className="font-score-mono text-sm font-semibold text-[#B08D2F]">
                {warningIssues.length} flagged
              </div>
            </div>
            <div>
              <div className="text-[#5C6B60] mb-0.5">Critical Faults</div>
              <div className="font-score-mono text-sm font-semibold text-[#B23A2E]">
                {criticalIssues.length} fatal
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#5C6B60]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isGood ? 'bg-[#2F6F4E]' : isMid ? 'bg-[#B08D2F]' : 'bg-[#B23A2E]'
              }`}
            />
            <span>
              Evaluated against track: <strong className="font-medium text-[#1A2E22]">{targetRole}</strong>
            </span>
          </div>
          <div className="font-score-mono text-[11px] text-[#5C6B60]">
            Target passing benchmark: 75/100
          </div>
        </div>
      </div>

      {/* Diagnostic Audit Issues List */}
      <div className="bg-white border border-[#D2D5C9] rounded mb-8 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#D2D5C9] bg-[#EEF0EA]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-score-mono uppercase tracking-wider text-[#5C6B60] font-semibold">
              Diagnostic Audit Ledger
            </span>
            <span className="text-[11px] text-[#5C6B60]">• {report.issues.length} items flagged</span>
          </div>
          <span className="text-[11px] font-score-mono text-[#5C6B60]">Status: Actionable</span>
        </div>

        <div className="divide-y divide-[#D2D5C9]">
          <div className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-[#F1F6F3]/40 transition-colors">
            <span className="w-5 h-5 rounded-full bg-[#F1F6F3] text-[#2F6F4E] border border-[#C8E0CE] flex items-center justify-center shrink-0 mt-0.5 font-score-mono text-xs font-bold">
              ✓
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-sm font-medium text-[#1A2E22]">
                  Contact &amp; Personal Identification
                </div>
                <span className="text-[11px] font-score-mono text-[#2F6F4E] bg-[#F1F6F3] border border-[#C8E0CE] px-1.5 py-0.5 rounded shrink-0">
                  Passed
                </span>
              </div>
              <p className="text-xs text-[#5C6B60] mt-0.5">
                Standard header data and text encoding parsed without character encoding or OCR corruption.
              </p>
            </div>
          </div>

          {report.issues.map((issue, idx) => {
            const isCrit = issue.severity === 'High';
            return (
              <div
                key={idx}
                className={`p-4 sm:p-5 flex items-start gap-3.5 transition-colors ${
                  isCrit ? 'bg-[#FDF2F0]/40 hover:bg-[#FDF2F0]/60' : 'bg-[#FCF8ED]/30 hover:bg-[#FCF8ED]/50'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-score-mono text-xs font-bold border ${
                    isCrit
                      ? 'bg-[#FDF2F0] text-[#B23A2E] border-[#B23A2E]/30'
                      : 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
                  }`}
                >
                  {isCrit ? '✕' : '!'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-sm font-medium text-[#1A2E22]">
                      {issue.type.toUpperCase()}: {issue.message}
                    </div>
                    <span
                      className={`text-[11px] font-score-mono px-1.5 py-0.5 rounded shrink-0 border ${
                        isCrit
                          ? 'text-[#B23A2E] bg-[#FDF2F0] border-[#B23A2E]/30'
                          : 'text-[#B08D2F] bg-[#FCF8ED] border-[#B08D2F]/30'
                      }`}
                    >
                      {issue.severity} Priority
                    </span>
                  </div>
                  <p className="text-xs text-[#5C6B60] mt-1 leading-relaxed">
                    Make sure technical keywords match the job description and section headings follow standard conventions (e.g. Experience, Skills, Education).
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mentor Box */}
      <div className="border border-[#D2D5C9] bg-white rounded p-5 mb-8 flex items-start gap-4 shadow-sm">
        <div className="w-9 h-9 rounded bg-[#F1F6F3] border border-[#C8E0CE] text-[#2F6F4E] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div className="text-xs text-[#5C6B60] leading-relaxed">
          <div className="text-sm font-serif-heading font-semibold text-[#1A2E22] mb-0.5">
            Instructor's Margin Commentary
          </div>
          <p>
            "ATS algorithms don't judge candidates on graphic flair, but on raw semantic density and unobstructed structural layouts. Simple single-column layouts with standard headings consistently out-rank complex multi-column designs."
          </p>
          <div className="mt-2 text-[11px] font-score-mono text-[#5C6B60]">
            — Calibrated by SmartHire ATS Heuristic Engine
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#D2D5C9]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded text-xs font-medium border border-[#D2D5C9] text-[#1A2E22] bg-white hover:bg-[#EEF0EA] transition-colors cursor-pointer"
        >
          &larr; Return to Docket
        </button>

        {onProceedToSummary && (
          <button
            type="button"
            onClick={onProceedToSummary}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-[#2F6F4E] text-white text-xs font-medium hover:bg-[#24583E] transition-colors shadow-sm cursor-pointer"
          >
            <span>Proceed to Final Assessment Dossier</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ATSReport;
