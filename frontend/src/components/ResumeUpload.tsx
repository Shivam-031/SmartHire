import React, { useState, useRef } from 'react';

interface ResumeUploadProps {
  onUploadSuccess?: (resumeId: number) => void;
  onATSCheckRequested?: () => void;
  onSkip?: () => void;
  onOpenEditor?: () => void;
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
  const [uploadedResumeId, setUploadedResumeId] = useState<number | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [candidateName, setCandidateName] = useState<string | null>(null);
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

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a PDF, DOCX, or TXT file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume document.');
      }

      setUploadedResumeId(data.resume_id);
      setExtractedSkills(data.extracted_skills || []);
      setCandidateName(data.candidate_name || file.name);

      if (onUploadSuccess) {
        onUploadSuccess(data.resume_id);
      }
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
      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: rawText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume content.');
      }

      setUploadedResumeId(data.resume_id);
      setExtractedSkills(data.extracted_skills || []);
      setCandidateName(data.candidate_name || 'Candidate Resume Text');

      if (onUploadSuccess) {
        onUploadSuccess(data.resume_id);
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading resume text.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 text-left animate-fadeIn select-none">
      {/* Top Header Block: Step Indicator & Precision Titles (Stitch Screen 03) */}
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
          Parsing engine v2.8 (spaCy + regex extraction)
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
                AUTO-PARSE 99.4%
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
                <span className="material-symbols-outlined text-[12px] text-[#22d3ee]">check</span> LaTeX parsed
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
                  <span>Parsing Ingestion Pipeline...</span>
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

      {/* Active Ingestion Result Pill (If Uploaded) */}
      {uploadedResumeId && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-white/[0.02] to-transparent border border-emerald-500/30 backdrop-blur-xl shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">task_alt</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">
                  Resume Successfully Ingested (ID: #{uploadedResumeId})
                </h4>
                <p className="text-xs text-[#a1a1aa]">
                  Parsed Candidate: <span className="text-white font-medium">{candidateName}</span> • Extracted {extractedSkills.length} key attributes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {onATSCheckRequested && (
                <button
                  type="button"
                  onClick={onATSCheckRequested}
                  className="btn-glass px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Run Full ATS Diagnostic
                </button>
              )}
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="btn-gradient-primary px-4 py-2 text-xs font-semibold text-white cursor-pointer shadow-md"
                >
                  Proceed to Interview &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Extracted Skills Chips */}
          {extractedSkills.length > 0 && (
            <div className="pt-3 border-t border-white/[0.06]">
              <span className="font-mono text-[10px] uppercase text-[#71717a] tracking-wider block mb-2">
                Detected Technical Keywords:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {extractedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] text-white/90 border border-white/[0.08]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
