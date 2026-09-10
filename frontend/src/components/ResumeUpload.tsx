import React, { useState, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

type Mode = 'file' | 'text';

interface ResumeUploadProps {
  onUploadSuccess?: (resumeId: number) => void;
  onATSCheckRequested?: () => void;
  onSkip?: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUploadSuccess,
  onATSCheckRequested,
  onSkip,
}) => {
  const [mode, setMode] = useState<Mode>('file');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedResumeId, setUploadedResumeId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);
      uploadFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setError(null);
      uploadFile(selected);
    }
  };

  const uploadFile = async (selectedFile: File) => {
    setLoading(true);
    setError(null);
    setSkills([]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      const resId = data.resume_id;
      setSkills(data.extracted_skills || []);
      setUploadedResumeId(resId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTextSubmit = async () => {
    if (!text.trim()) {
      setError('Please provide your resume text.');
      return;
    }

    setLoading(true);
    setError(null);
    setSkills([]);

    try {
      const response = await fetch('http://localhost:5000/api/resume/manual-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Processing failed');
      const resId = data.resume_id;
      setSkills(data.extracted_skills || []);
      setUploadedResumeId(resId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setText('');
    setSkills([]);
    setError(null);
    setUploadedResumeId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProceed = () => {
    if (uploadedResumeId && onUploadSuccess) {
      onUploadSuccess(uploadedResumeId);
    } else if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="max-w-[960px] mx-auto text-left">
      {/* Stage Subheader */}
      <div className="flex items-center gap-2 text-xs font-score-mono text-[#5C6B60] mb-2 tracking-wide">
        <span className="text-[#2F6F4E] font-semibold">STAGE 02 // INTAKE</span>
        <span>·</span>
        <span>DOCUMENT INGESTION &amp; PROFILE MAPPING</span>
      </div>

      {/* Main Title & Description */}
      <h1 className="text-3xl font-medium font-serif-heading text-[#1A2E22] tracking-tight mb-2">
        Upload your resume
      </h1>
      <p className="text-sm text-[#5C6B60] mb-6 leading-relaxed max-w-2xl">
        We'll parse out your skills to personalize your questions and check ATS compatibility.
        PDF or DOCX, up to 5MB.
      </p>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded bg-[#FDF2F0] border border-[#B23A2E] text-xs text-[#B23A2E] flex items-start gap-3">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong className="font-semibold block mb-0.5">Extraction Protocol Error</strong>
            {error}
          </div>
        </div>
      )}

      {/* Loading State Spinner */}
      {loading && (
        <div className="mb-6 p-8 bg-white border border-[#D2D5C9] rounded text-center">
          <LoadingSpinner message="Extracting competencies & calibrating question rubric..." />
        </div>
      )}

      {/* Main Ingestion Docket Card */}
      {!file && skills.length === 0 && (
        <>
          {mode === 'file' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`dropzone-dashed rounded p-10 mb-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none ${
                isDragOver ? 'border-[#2F6F4E] bg-[#E8EDE4]' : ''
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded bg-white border border-[#D2D5C9] flex items-center justify-center text-[#5C6B60] mb-3.5 shadow-sm">
                <svg className="w-6 h-6 text-[#2F6F4E]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-sm font-medium text-[#1A2E22] mb-1">
                Drag and drop your resume here, or <span className="text-[#2F6F4E] underline underline-offset-2 decoration-1 font-semibold">click to browse</span>.
              </div>
              <div className="text-xs text-[#5C6B60]">
                Supported formats: PDF, DOCX (Maximum file size: 5MB)
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#D2D5C9] rounded p-6 mb-5">
              <label className="block text-xs font-semibold text-[#5C6B60] uppercase tracking-wider mb-2 font-score-mono">
                Manual Text Docket Intake
              </label>
              <textarea
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your plain resume text or raw candidate profile content here..."
                className="w-full text-xs font-mono p-3.5 rounded border border-[#D2D5C9] focus:outline-none focus:border-[#2F6F4E] focus:ring-1 focus:ring-[#2F6F4E] text-[#1A2E22] placeholder:text-[#8A968E] mb-3"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleManualTextSubmit}
                  disabled={loading || !text.trim()}
                  className="px-4 py-2 text-xs font-medium rounded bg-[#2F6F4E] text-white hover:bg-[#24583E] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  Process Text
                </button>
              </div>
            </div>
          )}

          {/* Secondary Input Toggle / Skip Option */}
          <div className="flex items-center justify-between mb-8 px-1">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'file' ? 'text' : 'file');
                setError(null);
              }}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#1A2E22] hover:text-[#2F6F4E] transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-[#5C6B60]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{mode === 'file' ? 'Or paste your resume text instead' : 'Switch back to file upload'}</span>
            </button>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-[#5C6B60] hover:text-[#1A2E22] underline underline-offset-4 decoration-1 decoration-[#D2D5C9] hover:decoration-[#1A2E22] transition-colors cursor-pointer"
              >
                Skip — I'll answer generic questions for this role
              </button>
            )}
          </div>
        </>
      )}

      {/* Ingested / Uploaded File Summary State */}
      {(file || skills.length > 0) && (
        <div className="bg-white border border-[#D2D5C9] rounded p-5 mb-8 shadow-[0_1px_2px_rgba(26,46,34,0.04)]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#F1F6F3] border border-[#C8E0CE] flex items-center justify-center text-[#2F6F4E]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[#1A2E22]">
                    {file ? file.name : 'Candidate_Profile_Docket.txt'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-score-mono text-[#2F6F4E] bg-[#F1F6F3] px-2 py-0.5 rounded border border-[#C8E0CE]">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Parsed &amp; Validated
                  </span>
                </div>
                <div className="text-xs text-[#5C6B60] font-score-mono mt-0.5">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Direct text'} · Extracted {skills.length} competencies
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-xs text-[#5C6B60] hover:text-[#B23A2E] transition-colors flex items-center gap-1 px-2.5 py-1 rounded border border-[#D2D5C9] hover:border-[#B23A2E] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Remove</span>
            </button>
          </div>

          {/* Extracted Skills Tags */}
          <div className="pt-3.5 hairline-t">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-[#1A2E22]">Extracted Core Skills &amp; Signals</span>
              <span className="text-[11px] font-score-mono text-[#5C6B60]">Ready for question personalization</span>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded text-xs font-normal text-[#1A2E22] bg-[#EEF0EA] border border-[#D2D5C9]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5C6B60] italic">
                No explicit keywords recognized from standard dictionary; fallback baseline questions will be generated.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Informational Worksheet Callout */}
      <div className="border border-[#D2D5C9] rounded p-4 bg-white mb-8 flex items-start gap-3 shadow-[0_1px_2px_rgba(26,46,34,0.02)]">
        <div className="w-5 h-5 rounded-full border border-[#D2D5C9] flex items-center justify-center text-[#5C6B60] shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="text-xs leading-relaxed text-[#5C6B60]">
          <strong className="font-medium text-[#1A2E22]">Rubric alignment notice:</strong>{' '}
          These extracted competencies will automatically calibrate the mock interviewer questions and
          populate your ATS compatibility scoring report. You can review and refine all keyword alignments prior to the final loop summary.
        </div>
      </div>

      {/* Action Footer */}
      <div className="hairline-t pt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#5C6B60] font-score-mono">
          <span className={`w-2 h-2 rounded-full ${uploadedResumeId ? 'bg-[#2F6F4E]' : 'bg-[#D2D5C9]'}`} />
          Status: {uploadedResumeId ? 'Document verified & ready' : 'Awaiting document intake'}
        </div>

        <div className="flex items-center gap-3">
          {uploadedResumeId && onATSCheckRequested && (
            <button
              type="button"
              onClick={onATSCheckRequested}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded border border-[#D2D5C9] bg-white text-xs font-medium text-[#1A2E22] hover:bg-[#EEF0EA] transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-[#2F6F4E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Audit ATS Compatibility</span>
            </button>
          )}

          <button
            type="button"
            disabled={!uploadedResumeId}
            onClick={handleProceed}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#2F6F4E] text-white text-xs font-medium hover:bg-[#24583E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
          >
            <span>Proceed to Role Selection</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
