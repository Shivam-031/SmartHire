import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface Question {
  id: number;
  question_text: string;
  category?: string;
  expected_keywords?: string[];
}

interface Feedback {
  relevance_score: number;
  clarity_score: number;
  suggestions: string[];
}

interface InterviewQAProps {
  sessionId: number;
  questions: Question[];
  onComplete: (score: number) => void;
}

export const InterviewQA: React.FC<InterviewQAProps> = ({
  sessionId,
  questions,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex] || {
    id: 1,
    question_text: 'Explain how you would design a scalable web architecture.',
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please provide a substantive technical answer before submitting.');
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save and evaluate answer');
      }

      setFeedback(data);
    } catch (err: any) {
      setError(err.message || 'Failed to save answer. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextOrFinish = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswer('');
      setFeedback(null);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/interview/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
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
    ? Math.round(((feedback.relevance_score * 0.7) + (feedback.clarity_score * 0.3)) * 100)
    : 0;

  return (
    <div className="max-w-[780px] mx-auto text-left">
      {/* Flow Breadcrumb & Step Meta */}
      <div className="flex items-center justify-between text-[11px] font-score-mono text-[#5C6B60] mb-3">
        <span>STAGE 03 // LIVE EXAM · TECHNICAL DRILL &amp; SYSTEM EVALUATION</span>
        <span>ALLOCATION: {String(questions.length).padStart(2, '0')} QUESTIONS</span>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[13px] text-[#5C6B60] mb-2 font-sans">
          <div className="flex items-baseline gap-2">
            <span className="text-[#1A2E22] font-semibold">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-[#5C6B60] text-[12px]">
              • {currentQuestion.category || 'Architecture & Technical Precision'}
            </span>
          </div>
          <span className="font-score-mono text-[12px] text-[#5C6B60]">
            Item #{String(currentQuestion.id).padStart(3, '0')}
          </span>
        </div>
        <div className="w-full h-1 bg-[#D2D5C9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2F6F4E] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mb-6">
        <h1 className="font-serif-heading text-2xl md:text-[28px] leading-[1.3] text-[#1A2E22] font-medium tracking-tight">
          {currentQuestion.question_text}
        </h1>
        <p className="text-[13px] text-[#5C6B60] mt-2 leading-relaxed">
          Structure your technical response around system constraints, architecture tradeoffs, and clear execution reasoning.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded bg-[#FDF2F0] border border-[#B23A2E] text-xs text-[#B23A2E] flex items-start gap-3">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong className="font-semibold block mb-0.5">Evaluation Error</strong>
            {error}
          </div>
        </div>
      )}

      {/* Answer Form Section */}
      {!feedback && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="answerInput" className="block text-[13px] font-medium text-[#1A2E22]">
                Your response
              </label>
              <div className="flex items-center gap-3 text-[12px] text-[#5C6B60]">
                <span>Format: Technical Essay</span>
                <span className="text-[#D2D5C9]">|</span>
                <span className="font-score-mono text-[11px] text-[#2F6F4E]">Draft active</span>
              </div>
            </div>

            <textarea
              id="answerInput"
              rows={9}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Outline your approach, key technologies, tradeoffs, and concrete implementation details..."
              className="w-full bg-white border border-[#D2D5C9] rounded p-4 text-[14px] leading-relaxed text-[#1A2E22] placeholder-[#8A968E] focus:outline-none focus:border-[#2F6F4E] focus:ring-1 focus:ring-[#2F6F4E] transition-all resize-y shadow-sm font-sans"
            />

            <div className="flex items-center justify-between mt-2 text-[12px] text-[#5C6B60]">
              <span>Tip: Mention specific failure modes, edge cases, and design tradeoffs.</span>
              <span className="font-score-mono text-[11px]">{wordCount} words</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-[#5C6B60]">
              Graded on relevance, clarity, and keyword precision.
            </div>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={loading || !answer.trim()}
              className="px-5 py-2.5 bg-[#2F6F4E] hover:bg-[#24583E] disabled:opacity-50 text-white text-[13px] font-medium rounded transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {loading ? (
                <span>Evaluating...</span>
              ) : (
                <>
                  <span>Submit answer</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="mt-6 p-8 bg-white border border-[#D2D5C9] rounded text-center">
          <LoadingSpinner message="Evaluating technical response against rubric..." />
        </div>
      )}

      {/* Evaluated Feedback Panel */}
      {feedback && !loading && (
        <div className="mt-8 pt-8 hairline-t transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2F6F4E]" />
              <span className="text-[11px] font-score-mono uppercase tracking-wider text-[#2F6F4E] font-semibold">
                Evaluated Feedback
              </span>
            </div>
            <span className="text-[12px] font-score-mono text-[#5C6B60]">
              Calibrated by SmartHire Rubric Engine
            </span>
          </div>

          <div className="bg-white border border-[#D2D5C9] rounded p-6 shadow-sm">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-score-mono text-[42px] font-semibold text-[#2F6F4E] leading-none tracking-tight">
                {questionScore}
              </span>
              <span className="font-score-mono text-[18px] text-[#5C6B60]">/100</span>
              <span
                className={`ml-3 px-2 py-0.5 text-[11px] font-score-mono rounded border ${
                  questionScore >= 70
                    ? 'bg-[#F1F6F3] text-[#2F6F4E] border-[#C8E0CE]'
                    : 'bg-[#FCF8ED] text-[#B08D2F] border-[#B08D2F]/30'
                }`}
              >
                {questionScore >= 70 ? 'Passing Bar Met' : 'Review Suggested'}
              </span>
            </div>

            <p className="text-[16px] text-[#1A2E22] font-medium leading-normal mb-2">
              {questionScore >= 80
                ? 'Strong keyword coverage and methodical architectural reasoning'
                : questionScore >= 60
                ? 'Satisfactory technical approach with room for deeper trade-off analysis'
                : 'Limited keyword match; recommend detailing system components more explicitly'}
            </p>

            {feedback.suggestions && feedback.suggestions.length > 0 && (
              <div className="mt-4 pt-4 hairline-t space-y-2">
                <span className="font-medium text-[#1A2E22] text-xs block">
                  Examiner Recommendations:
                </span>
                <ul className="space-y-1.5 text-xs text-[#5C6B60]">
                  {feedback.suggestions.map((sug, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="text-[#2F6F4E] mt-0.5">&bull;</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="hairline-t mt-5 pt-4 grid grid-cols-2 gap-4 text-[12px]">
              <div className="space-y-1">
                <span className="font-medium text-[#1A2E22] block">Technical Relevance</span>
                <span className="font-score-mono text-sm text-[#2F6F4E]">
                  {(feedback.relevance_score * 100).toFixed(0)}%
                </span>
                <p className="text-[#5C6B60] text-[11px]">Alignment with domain expectations &amp; keywords.</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-[#1A2E22] block">Clarity &amp; Structure</span>
                <span className="font-score-mono text-sm text-[#2F6F4E]">
                  {(feedback.clarity_score * 100).toFixed(0)}%
                </span>
                <p className="text-[#5C6B60] text-[11px]">Readability, conciseness, and precision.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-[#5C6B60]">
              <svg className="w-4 h-4 text-[#2F6F4E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Score recorded to docket sheet #03</span>
            </div>

            <button
              type="button"
              onClick={handleNextOrFinish}
              className="px-5 py-2.5 bg-[#2F6F4E] hover:bg-[#24583E] text-white text-[13px] font-medium rounded transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>
                {currentIndex < questions.length - 1
                  ? `Next question (${currentIndex + 2}/${questions.length}) →`
                  : 'Complete Interview & View Assessment Dossier →'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewQA;
