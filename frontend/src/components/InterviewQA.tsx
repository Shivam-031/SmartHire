import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface QuestionOption {
  label: string;
  text: string;
}

export interface QuestionItem {
  id: string | number;
  field?: string;
  role?: string;
  skill_tag?: string;
  question_type?: 'mcq' | 'long_answer';
  focus_dimension?: string;
  question_text: string;
  options?: QuestionOption[];
  expected_keywords?: string[];
  follow_ups?: {
    if_score_below_60?: { question_text: string; expected_keywords?: string[] };
    if_score_above_60?: { question_text: string; expected_keywords?: string[] };
  };
}

export interface InterviewerPersona {
  title: string;
  name: string;
  affiliation: string;
  opening: string;
  praise_remark?: string;
  nudge_remark?: string;
  wrap_up?: string;
}

interface InterviewQAProps {
  sessionId: number;
  questions: QuestionItem[];
  mode?: 'standard' | 'mock';
  field?: string;
  persona?: InterviewerPersona | null;
  onComplete: (score: number) => void;
}

export const InterviewQA: React.FC<InterviewQAProps> = ({
  sessionId,
  questions,
  mode = 'standard',
  field = 'it',
  persona,
  onComplete,
}) => {
  const [questionList, setQuestionList] = useState<QuestionItem[]>(questions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [interviewerRemark, setInterviewerRemark] = useState<string>(
    persona?.opening || 'Welcome to the formal structured examination docket.'
  );
  const [isBranchingFollowUp, setIsBranchingFollowUp] = useState(false);
  const [branchingTag, setBranchingTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questionList[currentIndex] || {
    id: '1',
    question_text: 'Explain how you would design a scalable web architecture.',
    question_type: 'long_answer'
  };

  const isMCQ = currentQuestion.question_type === 'mcq';
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const progressPercent = ((currentIndex + 1) / questionList.length) * 100;

  const defaultPersona: InterviewerPersona = {
    it: {
      title: 'Senior Technical Lead',
      name: 'Marcus Vance',
      affiliation: 'Principal Systems Architect · Core Platform',
      opening: "Welcome. We'll be walking through a sequence of technical examinations and architecture trade-offs. Be explicit about system constraints and your rationale."
    },
    management: {
      title: 'Hiring Partner & VP',
      name: 'Eleanor Hayes',
      affiliation: 'Vice President of Product & Operations',
      opening: "Good day. Today we will evaluate your decision-making framework, stakeholder alignment, and how you drive measurable business impact."
    },
    law: {
      title: 'Managing Partner',
      name: 'Julian Sterling',
      affiliation: 'Senior Regulatory & Corporate Counsel',
      opening: "Welcome to the legal competency audit. We will review statutory interpretations, contractual liabilities, and risk governance protocols."
    }
  }[field.toLowerCase()] || {
    title: 'Senior Technical Lead',
    name: 'Marcus Vance',
    affiliation: 'Principal Systems Architect',
    opening: 'Welcome to the evaluation docket.'
  };

  const activePersona = persona || defaultPersona;

  // Handle MCQ Submission
  const handleSubmitMCQ = async () => {
    if (!selectedOption) {
      setError('Please select an option before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/interview/submit-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentQuestion.id,
          selected_option: selectedOption
        })
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.error || 'Failed to submit MCQ answer.');

      setFeedback(data);

      if (mode === 'mock') {
        if (data.is_correct) {
          setInterviewerRemark("Accurate assessment. Let's proceed to the architectural reasoning phase.");
        } else {
          setInterviewerRemark("Option noted. Notice the underlying trade-off described in the evaluation rubric.");
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting answer');
      setLoading(false);
    }
  };

  // Handle Long Answer Submission
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please provide a substantive answer before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentQuestion.id,
          answer_text: answer,
          field: field
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate answer');
      }

      setFeedback(data);

      // In Mock Mode, fetch next turn remark & check branching
      if (mode === 'mock') {
        const turnRes = await fetch('http://localhost:5000/api/interview/mock/turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            score: data.overall_score,
            follow_up_rules: currentQuestion.follow_ups || {}
          })
        });
        if (turnRes.ok) {
          const turnData = await turnRes.json();
          setInterviewerRemark(turnData.interviewer_remark);

          // If follow-up branch exists and we haven't branched yet on this question
          if (turnData.branch_question && !isBranchingFollowUp) {
            const branchQ: QuestionItem = {
              id: `${currentQuestion.id}_followup`,
              field: field,
              role: currentQuestion.role,
              skill_tag: `${currentQuestion.skill_tag || 'Core'} (Follow-Up)`,
              question_type: 'long_answer',
              focus_dimension: turnData.branch_type === 'challenging' ? 'Advanced Trade-offs' : 'Clarifying Fundamentals',
              question_text: turnData.branch_question.question_text,
              expected_keywords: turnData.branch_question.expected_keywords || []
            };

            // Splice follow-up into question list right after current question
            const updated = [...questionList];
            updated.splice(currentIndex + 1, 0, branchQ);
            setQuestionList(updated);
            setBranchingTag(turnData.branch_type === 'challenging' ? 'Challenging Follow-Up Queued' : 'Clarifying Follow-Up Queued');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save answer. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextOrFinish = async () => {
    if (currentIndex < questionList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswer('');
      setSelectedOption(null);
      setFeedback(null);
      setError(null);
      setIsBranchingFollowUp(false);
      setBranchingTag(null);
    } else {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/interview/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to finalize interview');

        onComplete(data.overall_score);
      } catch (err: any) {
        setError('Error completing interview: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const questionScore = feedback
    ? isMCQ
      ? feedback.is_correct ? 100 : 0
      : Math.round((feedback.overall_score || 0.5) * 100)
    : 0;

  return (
    <div className="max-w-[820px] mx-auto text-left space-y-6">
      {/* Top Breadcrumb & Metadata */}
      <div className="flex items-center justify-between text-[11px] font-score-mono text-[#5C6B60]">
        <div className="flex items-center gap-2">
          <span className="text-[#2F6F4E] font-semibold uppercase">
            STAGE 04 // {mode === 'mock' ? 'MOCK INTERVIEW EXAMINATION' : 'STANDARD PRACTICE EXAMINATION'}
          </span>
          <span>·</span>
          <span className="uppercase text-[#1A2E22]">{field} Track</span>
        </div>
        <span>TOTAL QUESTIONS: {String(questionList.length).padStart(2, '0')}</span>
      </div>

      {/* Thin Timer / Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#5C6B60]">
          <span className="text-[#1A2E22] font-semibold">
            Inquiry {currentIndex + 1} of {questionList.length}
          </span>
          <span className="font-score-mono text-[11px]">
            {currentQuestion.skill_tag || 'System Competency'} · {isMCQ ? 'Multiple Choice' : 'Structured Oral'}
          </span>
        </div>
        <div className="w-full h-1 bg-[#D2D5C9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2F6F4E] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mock Interview Persona Banner */}
      {mode === 'mock' && (
        <div className="p-4 bg-[#F7F8F5] border border-[#D2D5C9] rounded space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#1A2E22] text-white flex items-center justify-center font-serif text-xs font-bold">
                {activePersona.name.charAt(0)}
              </div>
              <div>
                <span className="font-semibold text-xs text-[#1A2E22] block leading-tight">
                  {activePersona.name}
                </span>
                <span className="text-[10px] text-[#5C6B60] font-score-mono block leading-tight">
                  {activePersona.title} · {activePersona.affiliation}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-score-mono px-2 py-0.5 rounded bg-white border border-[#D2D5C9] text-[#2F6F4E] font-medium">
              Interviewer Persona Active
            </span>
          </div>

          <div className="p-3 bg-white border-l-2 border-[#2F6F4E] rounded-r text-xs text-[#1A2E22] italic font-serif leading-relaxed">
            &ldquo;{interviewerRemark}&rdquo;
          </div>

          {branchingTag && (
            <div className="text-[10px] font-score-mono text-[#2F6F4E] flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F4E] animate-ping" />
              <span>{branchingTag}</span>
            </div>
          )}
        </div>
      )}

      {/* Question Prompt Card */}
      <div className="p-6 bg-white border border-[#D2D5C9] rounded shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-score-mono text-[#5C6B60] uppercase tracking-wider bg-[#EEF0EA] px-2 py-0.5 rounded border border-[#D2D5C9]">
            {currentQuestion.focus_dimension || 'Technical Evaluation'}
          </span>
          <span className="text-[11px] font-score-mono text-[#5C6B60]">
            Item #{String(currentQuestion.id).slice(-4)}
          </span>
        </div>

        <h2 className="font-serif text-xl md:text-2xl text-[#1A2E22] font-semibold leading-snug">
          {currentQuestion.question_text}
        </h2>

        {isMCQ ? (
          <p className="text-xs text-[#5C6B60]">
            Select the definitive option adhering to standard industry specifications and theoretical principles.
          </p>
        ) : (
          <p className="text-xs text-[#5C6B60]">
            Structure your verbal or written response addressing constraints, tradeoffs, and concrete implementation examples.
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded bg-[#FCF0EE] border border-[#B23A2E]/30 text-xs text-[#B23A2E]">
          {error}
        </div>
      )}

      {/* Form Area: MCQ vs Long Answer */}
      {!feedback && (
        <div className="space-y-4">
          {isMCQ ? (
            /* MCQ Option Rows */
            <div className="space-y-2.5">
              {(currentQuestion.options || []).map((opt) => {
                const isSelected = selectedOption === opt.label;
                return (
                  <div
                    key={opt.label}
                    onClick={() => setSelectedOption(opt.label)}
                    className={`p-3.5 rounded border cursor-pointer transition-all flex items-center gap-3 select-none ${
                      isSelected
                        ? 'bg-[#F7F8F5] border-[#2F6F4E] ring-1 ring-[#2F6F4E] shadow-xs'
                        : 'bg-white border-[#D2D5C9] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center font-score-mono text-xs font-bold ${
                        isSelected
                          ? 'border-[#2F6F4E] bg-[#2F6F4E] text-white'
                          : 'border-[#D2D5C9] text-[#5C6B60]'
                      }`}
                    >
                      {opt.label}
                    </div>
                    <span className="text-xs text-[#1A2E22] leading-relaxed flex-1">
                      {opt.text}
                    </span>
                  </div>
                );
              })}

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitMCQ}
                  disabled={loading || !selectedOption}
                  className="px-5 py-2.5 bg-[#2F6F4E] hover:bg-[#25583E] disabled:opacity-50 text-white text-xs font-medium rounded transition-colors shadow-sm cursor-pointer"
                >
                  {loading ? 'Validating Option...' : 'Submit MCQ Response &rarr;'}
                </button>
              </div>
            </div>
          ) : (
            /* Long Answer Textarea */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-[#1A2E22]">Your Technical Formulations</label>
                <span className="font-score-mono text-[#5C6B60] text-[11px]">{wordCount} words drafted</span>
              </div>

              <textarea
                rows={7}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Outline your approach, key technologies, trade-offs, and concrete implementation details..."
                className="w-full bg-white border border-[#D2D5C9] rounded p-4 text-xs leading-relaxed text-[#1A2E22] placeholder-[#8A968E] focus:outline-none focus:border-[#2F6F4E] focus:ring-1 focus:ring-[#2F6F4E] shadow-xs"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#5C6B60]">
                  Calibrated for {field.toUpperCase()} rubric criteria.
                </span>

                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={loading || !answer.trim()}
                  className="px-5 py-2.5 bg-[#2F6F4E] hover:bg-[#25583E] disabled:opacity-50 text-white text-xs font-medium rounded transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {loading ? 'Evaluating Rubric...' : 'Record & Evaluate Response \u2192'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="p-8 bg-white border border-[#D2D5C9] rounded text-center">
          <LoadingSpinner message="Calibrating response against field-specific rubric..." />
        </div>
      )}

      {/* Evaluated Feedback Panel */}
      {feedback && !loading && (
        <div className="p-6 bg-white border border-[#D2D5C9] rounded shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2F6F4E]" />
              <span className="text-xs font-score-mono font-semibold uppercase text-[#2F6F4E]">
                Evaluator Dossier Rubric
              </span>
            </div>
            <span className="text-[11px] font-score-mono text-[#5C6B60]">
              Score Logged: Sheet No. 04
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-score-mono text-3xl font-bold text-[#2F6F4E]">
              {questionScore}
            </span>
            <span className="text-sm font-score-mono text-[#5C6B60]">/ 100</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-score-mono rounded border ${
                questionScore >= 70
                  ? 'bg-[#E8F3ED] text-[#2F6F4E] border-[#2F6F4E]/30'
                  : 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
              }`}
            >
              {questionScore >= 70 ? 'Competency Verified' : 'Refinement Recommended'}
            </span>
          </div>

          {/* Explanation / Suggestions */}
          {feedback.explanation && (
            <div className="p-3 bg-[#F7F8F5] border border-[#D2D5C9] rounded text-xs text-[#1A2E22] leading-relaxed">
              <strong className="block text-[11px] font-score-mono text-[#5C6B60] uppercase mb-1">
                Specification Analysis:
              </strong>
              {feedback.explanation}
            </div>
          )}

          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <div className="space-y-1.5">
              <strong className="block text-[11px] font-score-mono text-[#5C6B60] uppercase">
                Examiner Recommendations:
              </strong>
              <ul className="space-y-1 text-xs text-[#5C6B60]">
                {feedback.suggestions.map((sug: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#2F6F4E] font-bold">&bull;</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action to proceed */}
          <div className="pt-4 border-t border-[#D2D5C9] flex justify-end">
            <button
              type="button"
              onClick={handleNextOrFinish}
              className="px-5 py-2.5 bg-[#2F6F4E] hover:bg-[#25583E] text-white text-xs font-medium rounded transition-colors shadow-sm"
            >
              {currentIndex < questionList.length - 1
                ? `Next Question (${currentIndex + 2}/${questionList.length}) \u2192`
                : 'Complete Examination & Generate Dossier \u2192'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewQA;
