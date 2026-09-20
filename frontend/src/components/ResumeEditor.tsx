import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
  onSaved?: (resumeId: string) => void;
  onProceedToInterview?: () => void;
  onATSCheckRequested?: () => void;
  onNavigateToTemplates?: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  sqlResumeId,
  onSaved,
  onProceedToInterview,
  onATSCheckRequested,
  onNavigateToTemplates,
}) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resumeData, setResumeData] = useState<StructuredResumeData>({
    title: 'Primary Resume',
    template_id: 1,
    contact: {
      name: user?.name || 'Candidate Name',
      email: user?.email || 'candidate@example.com',
      phone: '+1 (555) 019-2834',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/candidate',
      portfolio: ''
    },
    summary: 'Experienced professional with demonstrated expertise in delivering high-impact solutions, collaborating across cross-functional teams, and maintaining rigorous quality standards.',
    experience: [
      {
        title: 'Senior Practitioner',
        company: 'Vanguard Systems Group',
        dates: '2023 - Present',
        bullets: [
          'Spearheaded key operational initiatives increasing project throughput by 35%.',
          'Architected reliable standards and mentored 5 junior colleagues.'
        ]
      }
    ],
    education: [
      {
        degree: 'B.S. in Computer Science & Engineering',
        school: 'State University',
        year: '2021',
        gpa: '3.8/4.0'
      }
    ],
    skills: [
      {
        category: 'Core Competencies',
        items: ['Problem Solving', 'System Architecture', 'Agile Methodologies', 'Documentation']
      }
    ],
    projects: [
      {
        title: 'SmartHire Evaluation Workbench',
        technologies: 'React, TypeScript, Python, Flask',
        description: 'Multi-field career evaluation platform with heuristic ATS and oral exam rubrics.',
        link: 'github.com/candidate/smarthire'
      }
    ]
  });

  // Load current resume on mount
  useEffect(() => {
    setLoading(true);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('http://localhost:5000/api/resume/editor/current', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.resume) {
          setResumeData(data.resume);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('http://localhost:5000/api/resume/editor', {
        method: 'POST',
        headers,
        body: JSON.stringify(resumeData)
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setSaveSuccess(true);
        if (data.id) {
          setResumeData(prev => ({ ...prev, id: data.id }));
          if (onSaved) onSaved(data.id);
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setSaving(false);
    }
  };

  const handlePrefillFromUpload = async () => {
    if (!sqlResumeId) return;
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/resume/editor/prefill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql_resume_id: sqlResumeId })
      });
      const data = await res.json();
      setSaving(false);
      if (data.resume) {
        setResumeData(prev => ({
          ...prev,
          ...data.resume,
          contact: { ...prev.contact, ...data.resume.contact }
        }));
      }
    } catch {
      setSaving(false);
    }
  };

  // Entry mutators
  const updateContact = (field: string, val: string) => {
    setResumeData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: val }
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', company: '', dates: '2024 - Present', bullets: ['Key accomplishment or leadership initiative.'] }
      ]
    }));
  };

  const removeExperience = (idx: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: 'Degree / Specialization', school: 'University / Institution', year: '2023' }
      ]
    }));
  };

  const removeEducation = (idx: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Action Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-[#D2D5C9] rounded shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2F6F4E]" />
          <div>
            <h2 className="font-serif text-base font-bold text-[#1A2E22]">Structured Resume Document Editor</h2>
            <p className="text-[11px] text-[#5C6B60]">MongoDB Document Sync · Instant Schema Validation</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {sqlResumeId && (
            <button
              type="button"
              onClick={handlePrefillFromUpload}
              className="px-3 py-1.5 text-xs text-[#2F6F4E] border border-[#2F6F4E]/40 rounded hover:bg-[#F1F6F3] transition-colors"
            >
              Pre-fill from Upload
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#2F6F4E] hover:bg-[#25583E] text-white text-xs font-medium rounded transition-colors shadow-sm flex items-center gap-1.5"
          >
            {saving ? (
              <span>Saving to Mongo...</span>
            ) : saveSuccess ? (
              <span>Saved Successfully ✓</span>
            ) : (
              <span>Save Resume Document</span>
            )}
          </button>

          {onATSCheckRequested && (
            <button
              type="button"
              onClick={onATSCheckRequested}
              className="px-3 py-1.5 border border-[#2F6F4E]/50 text-[#2F6F4E] hover:bg-[#F1F6F3] text-xs font-medium rounded transition-colors flex items-center gap-1"
            >
              <span>Audit with ATS &rarr;</span>
            </button>
          )}

          {onNavigateToTemplates && (
            <button
              type="button"
              onClick={onNavigateToTemplates}
              className="px-3 py-1.5 border border-[#D2D5C9] bg-white hover:bg-[#F7F8F5] text-[#1A2E22] text-xs font-medium rounded transition-colors flex items-center gap-1"
            >
              <span>Export PDF &rarr;</span>
            </button>
          )}

          {onProceedToInterview && (
            <button
              type="button"
              onClick={onProceedToInterview}
              className="px-4 py-2 border border-[#D2D5C9] bg-[#EEF0EA] hover:bg-[#E2E6DC] text-[#1A2E22] text-xs font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <span>Practice Interview &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5C6B60] bg-white border border-[#D2D5C9] rounded">
          Loading resume document...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Contact & Header */}
          <div className="p-5 bg-white border border-[#D2D5C9] rounded space-y-4">
            <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-2">
              <h3 className="font-serif text-sm font-bold text-[#1A2E22] uppercase tracking-wider">
                01 / Candidate Contact Information
              </h3>
              <span className="text-[10px] font-score-mono text-[#5C6B60]">Header Block</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#5C6B60] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={resumeData.contact.name}
                  onChange={(e) => updateContact('name', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] bg-[#FAFAF8] focus:border-[#2F6F4E]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#5C6B60] mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={resumeData.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] bg-[#FAFAF8] focus:border-[#2F6F4E]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#5C6B60] mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={resumeData.contact.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] bg-[#FAFAF8] focus:border-[#2F6F4E]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#5C6B60] mb-1 font-medium">Location (City, State/Country)</label>
                <input
                  type="text"
                  value={resumeData.contact.location}
                  onChange={(e) => updateContact('location', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] bg-[#FAFAF8] focus:border-[#2F6F4E]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] text-[#5C6B60] mb-1 font-medium">LinkedIn / Portfolio URL</label>
                <input
                  type="text"
                  value={resumeData.contact.linkedin}
                  onChange={(e) => updateContact('linkedin', e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] bg-[#FAFAF8] focus:border-[#2F6F4E]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Summary */}
          <div className="p-5 bg-white border border-[#D2D5C9] rounded space-y-3">
            <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-2">
              <h3 className="font-serif text-sm font-bold text-[#1A2E22] uppercase tracking-wider">
                02 / Executive Summary
              </h3>
              <span className="text-[10px] font-score-mono text-[#5C6B60]">Narrative Anchor</span>
            </div>
            <textarea
              rows={3}
              value={resumeData.summary}
              onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="State your technical leadership, discipline focus, and high-impact accomplishments..."
              className="w-full p-3 border border-[#D2D5C9] rounded text-xs text-[#1A2E22] bg-[#FAFAF8] leading-relaxed focus:border-[#2F6F4E]"
            />
          </div>

          {/* Section 3: Work Experience */}
          <div className="p-5 bg-white border border-[#D2D5C9] rounded space-y-4">
            <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-2">
              <h3 className="font-serif text-sm font-bold text-[#1A2E22] uppercase tracking-wider">
                03 / Professional Experience
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs text-[#2F6F4E] font-medium hover:underline"
              >
                + Add Role Entry
              </button>
            </div>

            <div className="space-y-4">
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="p-4 bg-[#F7F8F5] border border-[#D2D5C9] rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-score-mono text-[10px] text-[#5C6B60] uppercase font-bold">
                      Position Entry 0{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="text-[#B23A2E] text-[11px] hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-[#5C6B60] mb-0.5">Job Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeData(prev => {
                            const arr = [...prev.experience];
                            arr[idx].title = val;
                            return { ...prev, experience: arr };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 border border-[#D2D5C9] rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#5C6B60] mb-0.5">Company / Organization</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeData(prev => {
                            const arr = [...prev.experience];
                            arr[idx].company = val;
                            return { ...prev, experience: arr };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 border border-[#D2D5C9] rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#5C6B60] mb-0.5">Date Range</label>
                      <input
                        type="text"
                        value={exp.dates}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeData(prev => {
                            const arr = [...prev.experience];
                            arr[idx].dates = val;
                            return { ...prev, experience: arr };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 border border-[#D2D5C9] rounded text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#5C6B60] mb-0.5">Impact Bullets (one per line)</label>
                    <textarea
                      rows={2}
                      value={exp.bullets.join('\n')}
                      onChange={(e) => {
                        const bullets = e.target.value.split('\n');
                        setResumeData(prev => {
                          const arr = [...prev.experience];
                          arr[idx].bullets = bullets;
                          return { ...prev, experience: arr };
                        });
                      }}
                      className="w-full p-2 border border-[#D2D5C9] rounded text-xs bg-white leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Education */}
          <div className="p-5 bg-white border border-[#D2D5C9] rounded space-y-4">
            <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-2">
              <h3 className="font-serif text-sm font-bold text-[#1A2E22] uppercase tracking-wider">
                04 / Academic Credentials &amp; Education
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="text-xs text-[#2F6F4E] font-medium hover:underline"
              >
                + Add Academic Entry
              </button>
            </div>

            <div className="space-y-3">
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="p-3 bg-[#F7F8F5] border border-[#D2D5C9] rounded grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-center">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-[#5C6B60]">Degree / Certificate</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const val = e.target.value;
                        setResumeData(prev => {
                          const arr = [...prev.education];
                          arr[idx].degree = val;
                          return { ...prev, education: arr };
                        });
                      }}
                      className="w-full px-2 py-1 border border-[#D2D5C9] rounded bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#5C6B60]">Institution</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => {
                        const val = e.target.value;
                        setResumeData(prev => {
                          const arr = [...prev.education];
                          arr[idx].school = val;
                          return { ...prev, education: arr };
                        });
                      }}
                      className="w-full px-2 py-1 border border-[#D2D5C9] rounded bg-white text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-[#5C6B60]">Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeData(prev => {
                            const arr = [...prev.education];
                            arr[idx].year = val;
                            return { ...prev, education: arr };
                          });
                        }}
                        className="w-full px-2 py-1 border border-[#D2D5C9] rounded bg-white text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-[#B23A2E] text-xs pt-3 hover:underline"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeEditor;

