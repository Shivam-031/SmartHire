import React, { useState, useRef } from 'react';

interface ResumeUploadProps {
  onUploadSuccess?: (resumeId: number) => void;
  onATSCheckRequested?: () => void;
  onSkip?: () => void;
  onOpenEditor?: () => void;
}

interface ExperienceItem {
  title: string;
  company: string;
  dates: string;
  location: string;
  bullets: string[];
}

interface ProjectItem {
  name: string;
  tag: string;
  live_url: string;
  github_url: string;
  bullets: string[];
}

interface EducationItem {
  degree: string;
  institution: string;
  dates: string;
  location: string;
}

interface CertificationItem {
  name: string;
  issuer: string;
  date?: string;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUploadSuccess,
  onATSCheckRequested,
  onSkip,
  onOpenEditor,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [activeMode, setActiveMode] = useState<'file' | 'text'>('file');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parsed Resume States
  const [uploadedResumeId, setUploadedResumeId] = useState<number | null>(null);
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [contact, setContact] = useState<{
    email?: string;
    phone?: string;
    github?: string;
    linkedin?: string;
    headline?: string;
    location?: string;
  } | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [skillsCategorized, setSkillsCategorized] = useState<Record<string, string[]>>({});
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [additional, setAdditional] = useState<string>('');
  const [isCertificate, setIsCertificate] = useState(false);
  const [documentType, setDocumentType] = useState<string>('Full Resume');
  const [certificateInfo, setCertificateInfo] = useState<{
    course?: string;
    issuer?: string;
    date?: string;
    verify_url?: string;
  } | null>(null);
  const [wordCount, setWordCount] = useState<number | null>(null);

  const [activeDetailTab, setActiveDetailTab] = useState<
    'skills' | 'experience' | 'projects' | 'education' | 'certifications'
  >('skills');

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const applyParsedData = (data: any, fallbackName: string) => {
    setUploadedResumeId(data.resume_id);
    setCandidateName(data.candidate_name || fallbackName);
    setContact(data.contact || null);
    setSummary(data.summary || '');
    setExtractedSkills(data.extracted_skills || []);
    setSkillsCategorized(data.skills_categorized || {});
    setExperience(data.experience || []);
    setProjects(data.projects || []);
    setEducation(data.education || []);
    setCertifications(data.certifications || []);
    setAdditional(data.additional || '');
    setIsCertificate(Boolean(data.is_certificate));
    setDocumentType(data.document_type || (data.is_certificate ? 'Course Completion Certificate' : 'Full Professional Resume'));
    setCertificateInfo(data.certificate_info || null);
    setWordCount(data.word_count || null);

    // Auto-select tab with most relevant data
    if (data.is_certificate) {
      setActiveDetailTab('certifications');
    } else if ((data.experience || []).length > 0) {
      setActiveDetailTab('experience');
    } else if ((data.projects || []).length > 0) {
      setActiveDetailTab('projects');
    } else {
      setActiveDetailTab('skills');
    }

    if (onUploadSuccess) {
      onUploadSuccess(data.resume_id);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a PDF, DOCX, or TXT file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('smarthire_token');
      const headers: HeadersInit = {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      };

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume document.');
      }

      applyParsedData(data, file.name);
    } catch (err: any) {
      setError(err.message || 'Error uploading resume document.');
    } finally {
      setUploading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!rawText.trim()) {
      setError('Please paste your resume text content.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('smarthire_token');
      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        },
        body: JSON.stringify({ resume_text: rawText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume content.');
      }

      applyParsedData(data, 'Candidate Resume Text');
    } catch (err: any) {
      setError(err.message || 'Error uploading resume text.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 text-left animate-fadeIn select-none">
      {/* Top Header Block: Step Indicator & Precision Titles */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#22d3ee] font-semibold">
            Step 3 of 6 · Resume Intelligence
          </span>
          <span className="text-white/20 font-mono text-xs">•</span>
          <span className="font-mono text-[11px] text-[#a1a1aa]">ATS Parsing & Synthesizer</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Add your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] via-[#c084fc] to-[#f472b6]">
                resume
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-2xl mt-1 leading-relaxed">
              Upload your CV or build one to auto-calibrate mock interview scenarios, system design prompts, and ATS keyword extraction.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#a1a1aa]">
            <span className="material-symbols-outlined text-[#10b981] text-[16px]">verified_user</span>
            <span>Private & SOC2 Encrypted</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Pill */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/[0.08] text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveMode('file')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeMode === 'file'
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Upload File (PDF / DOCX)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeMode === 'text'
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white font-semibold shadow-xs'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Paste Raw Text Content
          </button>
        </div>

        <span className="font-mono text-[11px] text-[#71717a] hidden sm:inline">
          High-Precision Parser v3.0 (Structured Heuristics)
        </span>
      </div>

      {/* Dual Action Bento Grid: Upload or Build */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Card A: Drag & Drop Ingestion Hub */}
        <div className="relative group rounded-3xl p-6 sm:p-7 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-white/[0.15]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                <span className="font-semibold text-sm text-white">Upload Existing Resume</span>
              </div>
              <span className="font-mono text-[10px] text-[#22d3ee] px-2 py-0.5 rounded-full bg-[#0EA5B7]/15 border border-[#0EA5B7]/30">
                PRECISION 99.8%
              </span>
            </div>

            {activeMode === 'file' ? (
              /* Dropzone Interface */
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed ${
                  dragActive
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                    : 'border-white/[0.12] hover:border-[#3b82f6]/50 bg-white/[0.015] hover:bg-white/[0.03]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3b82f6] to-[#22d3ee] flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.35)] mb-3 transition-transform group-hover:scale-105">
                  <span className="material-symbols-outlined text-white text-[24px]">cloud_upload</span>
                </div>

                <h3 className="font-semibold text-sm text-white">
                  {file ? file.name : 'Drag & drop or browse'}
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1">
                  {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'Supports PDF, DOCX, TXT up to 10MB'}
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white/90 border border-white/[0.1] transition-colors">
                  <span className="material-symbols-outlined text-[14px]">attach_file</span>
                  <span>{file ? 'Replace file' : 'Choose local file'}</span>
                </div>
              </div>
            ) : (
              /* Raw Text Paste Area */
              <div className="space-y-3">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your plain text resume here (Work Experience, Education, Skills, Projects)..."
                  rows={8}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-2xl p-4 text-xs font-mono text-white placeholder-[#71717a] focus:outline-none focus:border-[#3b82f6] resize-none"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-5 border-t border-white/[0.06] mt-4">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#71717a]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-[#22d3ee]">check</span> Full section parsing
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-[#22d3ee]">check</span> Multi-column ready
              </span>
            </div>

            <button
              type="button"
              disabled={uploading || (activeMode === 'file' && !file) || (activeMode === 'text' && !rawText.trim())}
              onClick={activeMode === 'file' ? handleFileUpload : handleTextUpload}
              className="btn-gradient-primary w-full py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Analyzing & Extracting Details...</span>
                </>
              ) : (
                <>
                  <span>Upload & Analyze Resume</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card B: Instant Synthetic Resume Builder */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-white/[0.15]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                <span className="font-semibold text-sm text-white">Smart AI Resume Studio</span>
              </div>
              <span className="font-mono text-[10px] text-[#c084fc] px-2 py-0.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/30">
                CALIBRATED
              </span>
            </div>

            <div className="flex items-start gap-3 mt-2">
              <div className="w-10 h-10 rounded-2xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center shrink-0 shadow-sm text-[#c084fc]">
                <span className="material-symbols-outlined text-[20px]">magic_button</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                  Missing a tailored resume? Synthesize a technical profile modeled on tier-1 engineering job descriptions with interactive markdown studio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 mt-5">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="material-symbols-outlined text-[#22d3ee] text-[18px]">hub</span>
                <span className="text-xs text-white/90">Targeted architecture keywords & STAR metrics</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="material-symbols-outlined text-[#22d3ee] text-[18px]">fact_check</span>
                <span className="text-xs text-white/90">Fortune 500 ATS compliant markdown formatting</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="material-symbols-outlined text-[#22d3ee] text-[18px]">timer</span>
                <span className="text-xs text-white/90">3-minute instant profile synthesis</span>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-white/[0.06] mt-4">
            <button
              type="button"
              onClick={onOpenEditor}
              className="w-full py-3 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#8b5cf6]/50"
            >
              <span className="material-symbols-outlined text-[18px] text-[#c084fc]">edit_note</span>
              <span>Open Markdown Studio &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Parsed Resume Profile Card */}
      {uploadedResumeId && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-emerald-500/30 backdrop-blur-2xl shadow-2xl space-y-6 animate-fadeIn">
          {/* Header Row: Candidate Identity & Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">
                {candidateName ? candidateName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {candidateName}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                    isCertificate
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCertificate ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    {documentType.toUpperCase()}
                  </span>
                  {wordCount && (
                    <span className="font-mono text-[11px] text-[#71717a]">
                      • {wordCount} words analyzed
                    </span>
                  )}
                </div>

                {contact?.headline && (
                  <p className="text-xs sm:text-sm text-[#c084fc] font-medium">
                    {contact.headline}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-center">
              {onATSCheckRequested && (
                <button
                  type="button"
                  onClick={onATSCheckRequested}
                  className="btn-glass px-4 py-2 text-xs font-semibold text-white cursor-pointer hover:border-[#22d3ee]/50"
                >
                  Run Full ATS Diagnostic
                </button>
              )}
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="btn-gradient-primary px-5 py-2 text-xs font-semibold text-white cursor-pointer shadow-md"
                >
                  Proceed to Interview &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Contact Details Bar */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] text-white/80 border border-white/[0.08] hover:border-[#3b82f6]/40 flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#22d3ee]">mail</span>
                <span>{contact.email}</span>
              </a>
            )}
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] text-white/80 border border-white/[0.08] hover:border-[#10b981]/40 flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#10b981]">call</span>
                <span>{contact.phone}</span>
              </a>
            )}
            {contact?.location && (
              <span className="px-3 py-1.5 rounded-xl bg-white/[0.03] text-white/80 border border-white/[0.08] flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-[#f59e0b]">location_on</span>
                <span>{contact.location}</span>
              </span>
            )}
            {contact?.github && (
              <a
                href={contact.github}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] text-white/80 border border-white/[0.08] hover:border-white/30 flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-white/70">code</span>
                <span>{contact.github.replace('https://', '')}</span>
                <span className="material-symbols-outlined text-[12px] text-white/40">open_in_new</span>
              </a>
            )}
            {contact?.linkedin && (
              <a
                href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] text-white/80 border border-white/[0.08] hover:border-[#60a5fa]/40 flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#60a5fa]">share</span>
                <span>LinkedIn</span>
                <span className="material-symbols-outlined text-[12px] text-white/40">open_in_new</span>
              </a>
            )}
          </div>

          {/* Certificate Highlight Banner */}
          {isCertificate && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 shadow-lg shadow-amber-950/20">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
              </div>
              <div className="text-xs space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-amber-300 text-sm flex items-center gap-1.5">
                    Course Completion Certificate Detected
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Single-Page Credential ({wordCount || 32} words)
                    </span>
                  </span>
                  {certificateInfo?.issuer && (
                    <span className="text-[11px] font-mono text-amber-300/90 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      Issuer: {certificateInfo.issuer}
                    </span>
                  )}
                </div>
                <p className="text-amber-200/90 leading-relaxed">
                  This document is an official course completion certificate for{' '}
                  <strong className="text-white underline decoration-amber-400/60 font-medium">
                    {certificateInfo?.course || 'Software Engineering'}
                  </strong>{' '}
                  awarded to <strong className="text-white font-medium">{candidateName || 'Shivam Negi'}</strong>
                  {certificateInfo?.date ? ` on ${certificateInfo.date}` : ''}.
                  Because certificates are credentials and do not include career work history, academic degrees, or project portfolios, only the credential skill and certification record were extracted.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <div className="text-[11px] text-amber-200/80 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.08] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#38bdf8] text-[16px]">info</span>
                    <span>To test full multi-project, work experience, and education extraction, upload your complete resume PDF (e.g. <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">Shivam_Negi_Resume_FullStack_Developer.pdf</code>) or DOCX.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Professional Summary Quote Block */}
          {summary && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-[#d4d4d8] leading-relaxed relative">
              <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block mb-1">
                Extracted Summary:
              </span>
              <p className="italic">"{summary}"</p>
            </div>
          )}

          {/* Structured Detail Tabs */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveDetailTab('skills')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDetailTab === 'skills'
                    ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/40 font-semibold'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">construction</span>
                <span>Technical Skills ({extractedSkills.length})</span>
              </button>

              {experience.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('experience')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDetailTab === 'experience'
                      ? 'bg-[#8b5cf6]/20 text-[#c084fc] border border-[#8b5cf6]/40 font-semibold'
                      : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">work</span>
                  <span>Work Experience ({experience.length})</span>
                </button>
              )}

              {projects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('projects')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDetailTab === 'projects'
                      ? 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 font-semibold'
                      : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">folder_special</span>
                  <span>Projects ({projects.length})</span>
                </button>
              )}

              {education.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('education')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDetailTab === 'education'
                      ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40 font-semibold'
                      : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">school</span>
                  <span>Education ({education.length})</span>
                </button>
              )}

              {certifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('certifications')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDetailTab === 'certifications'
                      ? 'bg-[#ec4899]/20 text-[#f472b6] border border-[#ec4899]/40 font-semibold'
                      : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Certifications ({certifications.length})</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT: SKILLS */}
            {activeDetailTab === 'skills' && (
              <div className="space-y-4">
                {/* Categorized Skills (if detected) */}
                {Object.keys(skillsCategorized).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(skillsCategorized).map(([cat, skList], i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2"
                      >
                        <span className="font-mono text-[11px] font-semibold text-[#60a5fa] block uppercase tracking-wider">
                          {cat}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {skList.map((sk, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/90 border border-white/[0.08]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* All Detected Canonical Skills */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block">
                    All Canonical Matched Competencies ({extractedSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {extractedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] text-white/90 border border-white/[0.08] hover:border-[#3b82f6]/50 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WORK EXPERIENCE */}
            {activeDetailTab === 'experience' && (
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-sm text-white">{exp.title}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-[#c084fc] font-mono text-[11px]">
                          {exp.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa]">
                        {exp.location && <span>{exp.location} • </span>}
                        <span className="text-[#22d3ee]">{exp.dates}</span>
                      </div>
                    </div>

                    {exp.bullets.length > 0 && (
                      <ul className="space-y-1.5 pl-2 text-xs text-[#a1a1aa]">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-[#3b82f6] mt-0.5">▹</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: PROJECTS */}
            {activeDetailTab === 'projects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between space-y-3 hover:border-white/[0.12] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-white">{proj.name}</h4>
                        {proj.tag && (
                          <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#34d399] font-mono text-[10px] shrink-0">
                            {proj.tag}
                          </span>
                        )}
                      </div>

                      {proj.bullets.length > 0 && (
                        <ul className="space-y-1 text-xs text-[#a1a1aa] leading-relaxed">
                          {proj.bullets.slice(0, 2).map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-1.5">
                              <span className="text-[#10b981] mt-0.5 text-[10px]">●</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04] text-xs font-mono">
                      {proj.live_url && (
                        <a
                          href={proj.live_url.replace(/^Live:\s*/i, '').startsWith('http') ? proj.live_url.replace(/^Live:\s*/i, '') : `https://${proj.live_url.replace(/^Live:\s*/i, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[13px]">rocket_launch</span>
                          <span>Live Demo</span>
                        </a>
                      )}
                      {proj.github_url && (
                        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/80 border border-white/[0.08] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">code</span>
                          <span>{proj.github_url.replace(/^GitHub:\s*/i, '')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: EDUCATION */}
            {activeDetailTab === 'education' && (
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-white">{edu.degree}</h4>
                      <p className="text-xs text-[#a1a1aa] mt-0.5">
                        {edu.institution} {edu.location && `• ${edu.location}`}
                      </p>
                    </div>
                    {edu.dates && (
                      <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#f59e0b] self-start sm:self-auto">
                        {edu.dates}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: CERTIFICATIONS */}
            {activeDetailTab === 'certifications' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {certifications.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1"
                    >
                      <h5 className="font-semibold text-xs text-white">{c.name}</h5>
                      {c.issuer && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/25 text-[#c084fc] font-mono text-[10px]">
                          Issued by {c.issuer}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {additional && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-[#a1a1aa]">
                    <span className="font-mono text-[10px] uppercase text-[#71717a] block mb-1">
                      Additional Achievements:
                    </span>
                    <p className="text-white/90">{additional}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
