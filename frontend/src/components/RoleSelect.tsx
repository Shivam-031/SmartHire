import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface RoleSelectProps {
  resumeId?: number | null;
  selectedRole?: string;
  onInterviewStart: (sessionId: number, questions: any[], role: string) => void;
  onBackToResume?: () => void;
}

interface RoleItem {
  id: string;
  name: string;
  track: string;
  description: string;
  keySkills: string[];
}

export const RoleSelect: React.FC<RoleSelectProps> = ({
  resumeId,
  selectedRole = 'Frontend Developer',
  onInterviewStart,
  onBackToResume,
}) => {
  const [role, setRole] = useState<string>(selectedRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleDefinitions: RoleItem[] = [
    {
      id: 'Backend Developer',
      name: 'Backend Developer',
      track: 'TRACK 01',
      description: 'Distributed systems, REST/gRPC APIs, database architecture, caching, concurrency, and server-side runtime performance.',
      keySkills: ['Python / Java', 'SQL & ORM', 'REST API', 'Docker', 'System Design'],
    },
    {
      id: 'Frontend Developer',
      name: 'Frontend Developer',
      track: 'TRACK 02',
      description: 'Modern framework architecture, component lifecycles, state management, web performance, and browser APIs.',
      keySkills: ['TypeScript', 'React', 'State Mgmt', 'Web Vitals', 'CSS/HTML'],
    },
    {
      id: 'Full Stack Developer',
      name: 'Full Stack Developer',
      track: 'TRACK 03',
      description: 'End-to-end product engineering spanning client experiences, backend services, schema design, and integration pipelines.',
      keySkills: ['React', 'Node.js', 'SQL / NoSQL', 'API Design', 'DevOps basics'],
    },
    {
      id: 'Data Analyst',
      name: 'Data Analyst',
      track: 'TRACK 04',
      description: 'Advanced SQL modeling, business metrics framing, statistical inference, data hygiene, and automated stakeholder dashboards.',
      keySkills: ['Python & Pandas', 'SQL', 'Tableau / BI', 'Statistics', 'Data Modeling'],
    },
    {
      id: 'QA / Test Engineer',
      name: 'QA / Test Engineer',
      track: 'TRACK 05',
      description: 'Test automation frameworks, end-to-end regression suites, test coverage strategies, and CI/CD quality verification gates.',
      keySkills: ['Selenium / Cypress', 'Pytest / JUnit', 'API Testing', 'CI/CD', 'Bug Tracking'],
    },
  ];

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // Demo user
          resume_id: resumeId || null,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start interview session');
      }

      onInterviewStart(data.session_id, data.questions, role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[960px] mx-auto text-left">
      {/* Intake Tag / Step Indicator */}
      <div className="flex items-center gap-2 text-xs font-score-mono text-[#5C6B60] mb-2 tracking-wide">
        <span className="text-[#2F6F4E] font-semibold">STAGE 01 // INTAKE</span>
        <span>·</span>
        <span>ROLE SPECIFICATION &amp; TRACK CALIBRATION</span>
      </div>

      {/* Primary Heading & Subtitle */}
      <h1 className="text-3xl font-medium font-serif-heading text-[#1A2E22] tracking-tight mb-2">
        What role are you preparing for?
      </h1>
      <p className="text-sm text-[#5C6B60] mb-6 leading-relaxed max-w-2xl">
        This shapes which technical interview questions you'll get and sets the ATS benchmark keyword rubric.
      </p>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded bg-[#FDF2F0] border border-[#B23A2E] text-xs text-[#B23A2E] flex items-start gap-3">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong className="font-semibold block mb-0.5">Session Initialization Error</strong>
            {error}
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="mb-6 p-8 bg-white border border-[#D2D5C9] rounded text-center">
          <LoadingSpinner message="Calibrating 5 core interview questions for your track..." />
        </div>
      )}

      {/* List of 5 Role Cards */}
      <div className="space-y-3 mb-8">
        {roleDefinitions.map((item) => {
          const isSelected = role === item.name;

          return (
            <div
              key={item.id}
              onClick={() => setRole(item.name)}
              className={`p-4 rounded border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                isSelected
                  ? 'bg-white border-[#2F6F4E] shadow-[0_2px_8px_rgba(47,111,78,0.1)] ring-1 ring-[#2F6F4E]'
                  : 'bg-white/80 hover:bg-white border-[#D2D5C9] hover:border-[#5C6B60]'
              }`}
            >
              <div className="pt-0.5">
                <input
                  type="radio"
                  name="target_role"
                  value={item.name}
                  checked={isSelected}
                  onChange={() => setRole(item.name)}
                  className="w-4 h-4 accent-[#2F6F4E] cursor-pointer"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-base text-[#1A2E22]">{item.name}</span>
                    {isSelected && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-score-mono text-[#2F6F4E] bg-[#F1F6F3] rounded border border-[#C8E0CE] font-medium">
                        Active Track
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-score-mono text-xs px-2 py-0.5 rounded border ${
                      isSelected
                        ? 'bg-[#F1F6F3] border-[#C8E0CE] text-[#2F6F4E] font-medium'
                        : 'bg-[#EEF0EA] border-[#D2D5C9] text-[#5C6B60]'
                    }`}
                  >
                    {item.track}
                  </span>
                </div>

                <p className="text-xs text-[#5C6B60] mt-1.5 leading-relaxed">
                  {item.description}
                </p>

                {/* Core Competency Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {item.keySkills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal text-[#5C6B60] bg-[#EEF0EA] border border-[#D2D5C9]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informational Worksheet Guidance Note */}
      <div className="border border-[#D2D5C9] bg-white rounded p-4 mb-8 flex items-start space-x-3.5 shadow-[0_1px_2px_rgba(26,46,34,0.02)]">
        <div className="p-1 rounded bg-[#EEF0EA] text-[#2F6F4E] shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-[#5C6B60] leading-relaxed">
          <span className="font-medium text-[#1A2E22]">Worksheet configuration note:</span> The selected track anchors the 25-point question bank and calibrates expected technical keywords, behavioral expectations, and ATS heuristic matching.
        </div>
      </div>

      {/* Action Footer */}
      <div className="hairline-t pt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-[#5C6B60] flex items-center space-x-2 font-score-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2F6F4E]" />
          <span>Selected Track: <strong className="text-[#1A2E22]">{role}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {onBackToResume && (
            <button
              type="button"
              onClick={onBackToResume}
              className="px-4 py-2.5 rounded border border-[#D2D5C9] bg-white text-xs font-medium text-[#1A2E22] hover:bg-[#EEF0EA] transition-colors cursor-pointer"
            >
              &larr; Document Intake
            </button>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#2F6F4E] text-white text-xs font-medium hover:bg-[#24583E] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            <span>Confirm Track &amp; Begin Practice</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
