import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';

interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
}

interface EducationItem {
  degree: string;
  school: string;
  year: string;
  gpa?: string;
}

interface SkillCategory {
  category: string;
  items: string[];
}

interface ProjectItem {
  title: string;
  technologies: string;
  description: string;
  link?: string;
}

interface StructuredResumeData {
  id?: string;
  title: string;
  template_id: number;
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio?: string;
  };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
}

interface ResumeEditorProps {
  sqlResumeId?: number | null;
  mongoResumeId?: string | null;
  onSaved?: (resumeId: string) => void;
  onProceedToInterview?: () => void;
  onATSCheckRequested?: () => void;
  onNavigateToTemplates?: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  sqlResumeId,
  mongoResumeId,
  onSaved,
  onProceedToInterview,
  onATSCheckRequested,
  onNavigateToTemplates,
}) => {
  const { user, token } = useAuth();
  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<StructuredResumeData>({
    title: 'Senior Engineer Dossier',
    template_id: 1,
    contact: {
      name: user?.name || 'Alex Chen',
      email: user?.email || 'alex.chen@example.com',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexchen',
      portfolio: '',
    },
    summary:
      'Systems engineer and technical lead specializing in high-throughput distributed systems, concurrent web applications, and ATS-optimized cloud architecture.',
    experience: [
      {
        title: 'Senior Systems Engineer',
        company: 'Vanguard Architecture Lab',
        dates: '2023 - Present',
        bullets: [
          'Spearheaded transition to event-driven microservices reducing p99 latency by 38%.',
          'Architected high-concurrency client interfaces serving 2.4M monthly active users.',
        ],
      },
    ],
    education: [
      {
        degree: 'B.S. in Computer Science',
        school: 'University of California, Berkeley',
        year: '2021',
        gpa: '3.8/4.0',
      },
    ],
    skills: [
      {
        category: 'Core Engineering',
        items: ['TypeScript', 'React 19', 'Node.js', 'Python', 'Go', 'Distributed Systems'],
      },
      {
        category: 'Data & Infra',
        items: ['PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS Lambda', 'Kafka'],
      },
    ],
    projects: [
      {
        title: 'Distributed Stream Ledger',
        technologies: 'Go, Kafka, Redis, gRPC',
        description:
          'High-throughput message pipeline capable of handling 85k events/sec with sub-5ms commit latency.',
        link: 'github.com/example/ledger',
      },
    ],
  });

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const storedToken = token || localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        };

        // 1. If mongoResumeId specified, load that saved mongo document
        if (mongoResumeId) {
          const res = await fetch(buildApiUrl(`/api/resume/editor?id=${mongoResumeId}`), { headers });
          if (res.ok) {
            const data = await res.json();
            if (data?.resume) {
              setResumeData(data.resume);
              return;
            }
          }
        }

        // 2. Prefill from uploaded resume (using sqlResumeId if available, or fallback to latest uploaded)
        const prefillUrl = sqlResumeId
          ? buildApiUrl(`/api/resume/editor/prefill?sql_resume_id=${sqlResumeId}`)
          : buildApiUrl('/api/resume/editor/prefill');

        const resPrefill = await fetch(prefillUrl, { headers });
        if (resPrefill.ok) {
          const data = await resPrefill.json();
          if (data?.resume) {
            setResumeData(data.resume);
            return;
          }
        }

        // 3. Fallback: if user is logged in, check user's saved resume
        if (storedToken) {
          const res = await fetch(buildApiUrl('/api/resume/editor'), { headers });
          if (res.ok) {
            const data = await res.json();
            if (data?.resume) {
              setResumeData(data.resume);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load resume editor data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [token, mongoResumeId, sqlResumeId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(buildApiUrl('/api/resume/editor'), {
        method: 'POST',
        headers,
        body: JSON.stringify(resumeData),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setSaveSuccess(true);
        if (data.id) {
          setResumeData((prev) => ({ ...prev, id: data.id }));
          if (onSaved) onSaved(data.id);
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'Failed to save resume document.');
      }
    } catch (err: any) {
      setSaving(false);
      setSaveError(err.message || 'Network error encountered.');
    }
  };

  const handlePrefillFromUpload = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const storedToken = token || localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      };
      const url = sqlResumeId
        ? buildApiUrl(`/api/resume/editor/prefill?sql_resume_id=${sqlResumeId}`)
        : buildApiUrl('/api/resume/editor/prefill');
      const res = await fetch(url, { headers });
      const data = await res.json();
      setSaving(false);
      if (data?.resume) {
        setResumeData(data.resume);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setSaveError('No uploaded resume found to prefill from.');
      }
    } catch (err: any) {
      setSaving(false);
      setSaveError(err.message || 'Error prefilling from upload.');
    }
  };

  const updateContact = (field: string, val: string) => {
    setResumeData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: val },
    }));
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: '',
          company: '',
          dates: '2024 - Present',
          bullets: ['Key accomplishment or technical initiative with measurable impact.'],
        },
      ],
    }));
  };

  const removeExperience = (idx: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx),
    }));
  };

  const updateExperience = (idx: number, field: string, val: any) => {
    setResumeData((prev) => {
      const exp = [...prev.experience];
      exp[idx] = { ...exp[idx], [field]: val };
      return { ...prev, experience: exp };
    });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn select-none">
      {/* Top Action Header Strip (Stitch Screen Resume Editor) */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc]" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Markdown Resume Studio
            </h2>
            <span className="font-mono text-[10px] text-[#22d3ee] px-2 py-0.5 rounded-full bg-[#0EA5B7]/15 border border-[#0EA5B7]/30">
              MongoDB Cloud Sync
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa]">
            Structured schema validation with real-time ATS keyword density checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrefillFromUpload}
            className="px-3 py-2 text-xs font-mono text-[#c084fc] border border-[#c084fc]/30 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Import information from your uploaded resume"
          >
            <span className="material-symbols-outlined text-[15px]">sync</span>
            <span>Pre-fill from Upload</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            {saving ? (
              <span>Saving Document...</span>
            ) : saveSuccess ? (
              <span>Saved Successfully ✓</span>
            ) : (
              <span>Save Resume</span>
            )}
          </button>

          {onATSCheckRequested && (
            <button
              type="button"
              onClick={onATSCheckRequested}
              className="btn-glass px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              Audit with ATS &rarr;
            </button>
          )}

          {onNavigateToTemplates && (
            <button
              type="button"
              onClick={onNavigateToTemplates}
              className="btn-glass px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              Template PDF &rarr;
            </button>
          )}

          {onProceedToInterview && (
            <button
              type="button"
              onClick={onProceedToInterview}
              className="btn-gradient-primary px-4 py-2 text-xs font-semibold cursor-pointer shadow-md"
            >
              Mock Interview &rarr;
            </button>
          )}
        </div>
      </div>

      {saveError && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {saveError}
        </div>
      )}

      {/* Editor Main Canvas */}
      <div className="space-y-6">
        {/* Contact Info Card */}
        <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-4">
          <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block">
            01 Contact Information & Links
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[#a1a1aa] block mb-1">Full Name</label>
              <input
                type="text"
                value={resumeData.contact.name}
                onChange={(e) => updateContact('name', e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-[#a1a1aa] block mb-1">Email</label>
              <input
                type="email"
                value={resumeData.contact.email}
                onChange={(e) => updateContact('email', e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-[#a1a1aa] block mb-1">Phone</label>
              <input
                type="text"
                value={resumeData.contact.phone}
                onChange={(e) => updateContact('phone', e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-[#a1a1aa] block mb-1">Location</label>
              <input
                type="text"
                value={resumeData.contact.location}
                onChange={(e) => updateContact('location', e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-[#a1a1aa] block mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={resumeData.contact.linkedin}
                onChange={(e) => updateContact('linkedin', e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-[#a1a1aa] block mb-1">Portfolio / GitHub</label>
              <input
                type="text"
                value={resumeData.contact.portfolio || ''}
                onChange={(e) => updateContact('portfolio', e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-3">
          <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block">
            02 Executive Professional Summary
          </span>
          <textarea
            value={resumeData.summary}
            onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
            rows={3}
            className="w-full bg-black/40 border border-white/[0.1] rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#7c3aed] leading-relaxed resize-none"
          />
        </div>

        {/* Experience Entries Card */}
        <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider">
              03 Work Experience ({resumeData.experience.length} Roles)
            </span>
            <button
              type="button"
              onClick={addExperience}
              className="text-xs font-mono text-[#c084fc] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Add Role</span>
            </button>
          </div>

          <div className="space-y-4">
            {resumeData.experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[#a1a1aa] block mb-1">Role Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[#a1a1aa] block mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex-1">
                      <label className="text-[#a1a1aa] block mb-1">Dates</label>
                      <input
                        type="text"
                        value={exp.dates}
                        onChange={(e) => updateExperience(idx, 'dates', e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3 py-1.5 text-white"
                      />
                    </div>
                    {resumeData.experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(idx)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
                        title="Remove Role"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[#a1a1aa] block mb-1 text-xs">
                    Impact Bullet Points (one per line)
                  </label>
                  <textarea
                    value={exp.bullets.join('\n')}
                    onChange={(e) =>
                      updateExperience(idx, 'bullets', e.target.value.split('\n'))
                    }
                    rows={3}
                    className="w-full bg-black/40 border border-white/[0.1] rounded-xl p-3 text-xs font-mono text-white leading-relaxed resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Taxonomy Card */}
        <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-4">
          <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block">
            04 Technical Skills & Keyword Taxonomy
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resumeData.skills.map((cat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{cat.category}</span>
                  <span className="font-mono text-[10px] text-[#71717a]">
                    {cat.items.length} items
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="px-2.5 py-1 rounded-full bg-white/[0.04] text-xs font-mono text-white/90 border border-white/[0.08]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
