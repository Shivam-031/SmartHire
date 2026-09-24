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
      const res = await fetch('http://localhost:5000/api/resume/manual-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to ingest text content.');
      }

      setUploadedResumeId(data.resume_id);
      setExtractedSkills(data.extracted_skills || []);
      setCandidateName(data.candidate_name || 'Direct Ingest');

      if (onUploadSuccess) {
        onUploadSuccess(data.resume_id);
      }
    } catch (err: any) {
      setError(err.message || 'Error processing resume text.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Visual Pipeline Stepper (Stitch Screen 06) */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs">
        <div className="relative flex items-center justify-between">
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-[#E5E7EB] z-0"></div>
          <div className="absolute top-1/2 left-6 w-[66%] -translate-y-1/2 h-0.5 bg-[#2E6FF2] z-0 transition-all duration-500"></div>

          {/* Step 1: Field Domain */}
          <div className="relative z-10 flex items-center gap-3 bg-white pr-3">
            <div className="w-8 h-8 rounded-full bg-[#2E6FF2] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-mono text-[10px] uppercase text-[#6B7078] font-bold">Step 01</span>
              <span className="text-xs font-semibold text-[#17181C]">Track Domain</span>
            </div>
          </div>

          {/* Step 2: Target Role */}
          <div className="relative z-10 flex items-center gap-3 bg-white px-3">
            <div className="w-8 h-8 rounded-full bg-[#2E6FF2] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-mono text-[10px] uppercase text-[#6B7078] font-bold">Step 02</span>
              <span className="text-xs font-semibold text-[#17181C]">Target Role</span>
            </div>
          </div>

          {/* Step 3: Resume Intake (Active) */}
          <div className="relative z-10 flex items-center gap-3 bg-white px-3">
            <div className="w-8 h-8 rounded-full bg-[#2E6FF2] flex items-center justify-center text-white font-mono text-xs font-bold ring-4 ring-[#2E6FF2]/20 shadow-xs">
              3
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-mono text-[10px] uppercase text-[#2E6FF2] font-bold">Step 03</span>
              <span className="text-xs font-bold text-[#17181C]">Resume Intake</span>
            </div>
          </div>

          {/* Step 4: Upcoming Live Exam */}
          <div className="relative z-10 flex items-center gap-3 bg-white pl-3 opacity-60">
            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] text-[#6B7078] flex items-center justify-center font-mono text-xs font-semibold">
              4
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-mono text-[10px] uppercase text-[#6B7078] font-bold">Step 04</span>
              <span className="text-xs font-medium text-[#6B7078]">Oral Exam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Intake Area */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B7078]">
                INTAKE PROTOCOL // STAGE 03
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E6FF2]/10 text-[#2E6FF2]">
                ATS Telemetry Ready
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17181C]">
              Upload Candidate Resume
            </h1>
            <p className="text-xs text-[#6B7078]">
              Automated syntax extraction, keyword frequency indexing, and section parsing.
            </p>
          </div>

          <div className="flex bg-[#F1F2F4] p-1 rounded-xl border border-[#E5E7EB] self-start sm:self-auto font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveMode('file')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeMode === 'file'
                  ? 'bg-white text-[#17181C] shadow-xs'
                  : 'text-[#6B7078] hover:text-[#17181C]'
              }`}
            >
              Document File
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('text')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeMode === 'text'
                  ? 'bg-white text-[#17181C] shadow-xs'
                  : 'text-[#6B7078] hover:text-[#17181C]'
              }`}
            >
              Direct Text Paste
            </button>
          </div>
        </div>

        {activeMode === 'file' ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-[#2E6FF2] bg-[#2E6FF2]/5'
                : 'border-[#D1D5DB] hover:border-[#2E6FF2] bg-[#F8F9FA]/60 hover:bg-[#F8F9FA]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center mx-auto mb-4 text-[#2E6FF2]">
              <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
            </div>
            <h3 className="text-base font-bold text-[#17181C] mb-1">
              {file ? file.name : 'Click to select or drag & drop resume'}
            </h3>
            <p className="text-xs text-[#6B7078] max-w-sm mx-auto mb-4">
              Supported formats: <strong className="font-mono text-[#17181C]">PDF</strong>,{' '}
              <strong className="font-mono text-[#17181C]">DOCX</strong>, or{' '}
              <strong className="font-mono text-[#17181C]">TXT</strong> (Max 10MB)
            </p>

            {file && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2E6FF2]/10 text-[#2E6FF2] text-xs font-mono font-semibold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{(file.size / 1024).toFixed(1)} KB selected</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase font-bold text-[#6B7078] block">
              Resume Text Content
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full text of your resume here including contact details, experience, skills, and education..."
              className="w-full p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] font-mono text-xs text-[#17181C] focus:outline-hidden focus:border-[#2E6FF2]"
            ></textarea>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B23A2E] text-xs font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>{error}</span>
          </div>
        )}

        {/* Upload Trigger Button */}
        {!uploadedResumeId && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={activeMode === 'file' ? handleFileUpload : handleTextUpload}
              disabled={uploading || (activeMode === 'file' ? !file : !rawText.trim())}
              className="w-full sm:w-auto px-6 py-3 bg-[#17181C] hover:bg-[#2A2B30] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Parsing Document Structure...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  <span>Ingest &amp; Extract Telemetry</span>
                </>
              )}
            </button>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-mono text-[#6B7078] hover:text-[#17181C] transition-colors"
              >
                Skip upload &amp; proceed directly &rarr;
              </button>
            )}
          </div>
        )}

        {/* Extracted Skills & Telemetry Ledger */}
        {uploadedResumeId && (
          <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#059669]">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span className="text-xs font-bold font-mono">
                  RESUME PARSED // DOCKET #{uploadedResumeId}
                </span>
              </div>
              {candidateName && (
                <span className="text-xs font-semibold text-[#17181C]">
                  Candidate: {candidateName}
                </span>
              )}
            </div>

            <div>
              <span className="font-mono text-[11px] uppercase text-[#6B7078] block mb-2 font-bold">
                Extracted Competencies ({extractedSkills.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {extractedSkills.length > 0 ? (
                  extractedSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white text-[#17181C] font-mono text-[11px] font-semibold rounded-lg border border-[#A7F3D0] shadow-2xs"
                    >
                      {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono text-[#6B7078]">
                    No explicit skill keywords recognized in initial extraction.
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#A7F3D0]/60">
              {onATSCheckRequested && (
                <button
                  type="button"
                  onClick={onATSCheckRequested}
                  className="px-4 py-2 bg-[#2E6FF2] text-white text-xs font-semibold rounded-xl hover:bg-[#2558C4] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  <span>Run ATS Compatibility Audit</span>
                </button>
              )}

              {onOpenEditor && (
                <button
                  type="button"
                  onClick={onOpenEditor}
                  className="px-4 py-2 bg-white text-[#17181C] text-xs font-semibold rounded-xl border border-[#D1D5DB] hover:bg-[#F8F9FA] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>Edit in In-App Editor</span>
                </button>
              )}

              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-4 py-2 bg-[#17181C] text-white text-xs font-semibold rounded-xl hover:bg-[#2A2B30] transition-colors cursor-pointer ml-auto flex items-center gap-1.5"
                >
                  <span>Proceed to Oral Exam</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
