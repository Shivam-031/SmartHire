import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface TemplateItem {
  id: number;
  name: string;
  code: string;
  badge: string;
  description: string;
  best_for: string;
}

interface ResumeTemplatePickerProps {
  resumeId?: string | null;
  onProceedToInterview?: () => void;
}

export const ResumeTemplatePicker: React.FC<ResumeTemplatePickerProps> = ({
  resumeId,
  onProceedToInterview
}) => {
  const { token } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const templates: TemplateItem[] = [
    {
      id: 1,
      name: 'Modern Editorial',
      code: 'TMPL-MODERN-01',
      badge: 'Recommended · System Default',
      description: 'Sophisticated typography pairing with deep forest green accents, refined hairline dividers, and high ATS parsing compliance.',
      best_for: 'Technology & Product Management Roles'
    },
    {
      id: 2,
      name: 'Classic Executive',
      code: 'TMPL-EXEC-02',
      badge: 'Traditional Formal',
      description: 'Centered header format, bold corporate section dividers, and high-density chronology preferred by enterprise evaluators.',
      best_for: 'Executive Leadership, Legal & Regulatory Tracks'
    },
    {
      id: 3,
      name: 'Minimal Compact',
      code: 'TMPL-MINIMAL-03',
      badge: 'Maximum ATS Density',
      description: 'Monochromatic, zero-decorative layout optimized for raw keyword parsing, monospace dates, and rapid recruiter scanning.',
      best_for: 'High-Volume Enterprise ATS Pipelines'
    }
  ];

  const handleExportPDF = async () => {
    setDownloading(true);
    setDownloadError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:5000/api/resume/export-pdf', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          template_id: selectedTemplate,
          resume_id: resumeId || null
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate PDF document.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SmartHire_Resume_Template_${selectedTemplate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloading(false);
    } catch (err: any) {
      setDownloadError(err.message || 'Error downloading PDF');
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="p-6 bg-white border border-[#D2D5C9] rounded shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D2D5C9] pb-4 mb-4">
          <div>
            <span className="text-[10px] font-score-mono uppercase text-[#5C6B60] tracking-wider block">
              Dossier Publishing Engine
            </span>
            <h2 className="font-serif text-xl font-bold text-[#1A2E22]">
              Select Resume Export Template
            </h2>
          </div>
          <span className="text-xs font-score-mono bg-[#EEF0EA] px-2.5 py-1 rounded border border-[#D2D5C9]">
            ReportLab PDF Engine
          </span>
        </div>

        <p className="text-xs text-[#5C6B60] leading-relaxed mb-6">
          Choose a typesetting layout for your structured resume. Each template is engineered to balance human editorial readability with automated ATS machine-readability.
        </p>

        {downloadError && (
          <div className="mb-4 p-3 bg-[#FCF0EE] border border-[#B23A2E]/30 rounded text-[#B23A2E] text-xs">
            {downloadError}
          </div>
        )}

        {/* 3 Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {templates.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-5 rounded border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  isSelected
                    ? 'bg-[#F7F8F5] border-[#2F6F4E] shadow-[0_2px_8px_rgba(47,111,78,0.12)] ring-1 ring-[#2F6F4E]'
                    : 'bg-white border-[#D2D5C9] hover:border-[#8A968E]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-score-mono text-[#5C6B60] bg-white border border-[#D2D5C9] px-2 py-0.5 rounded">
                      {tmpl.code}
                    </span>
                    <span className="text-[10px] text-[#2F6F4E] font-medium font-score-mono">
                      {tmpl.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#1A2E22] mb-2">
                    {tmpl.name}
                  </h3>

                  <p className="text-xs text-[#5C6B60] leading-relaxed mb-4">
                    {tmpl.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D2D5C9]">
                  <span className="text-[11px] text-[#1A2E22] block font-medium">
                    Recommended For:
                  </span>
                  <span className="text-[11px] text-[#5C6B60]">
                    {tmpl.best_for}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-[#F7F8F5] border border-[#D2D5C9] rounded flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5C6B60]">
            <span className="w-2 h-2 rounded-full bg-[#2F6F4E]" />
            <span>Active Format: <strong className="text-[#1A2E22]">Template #{selectedTemplate} ({templates.find(t => t.id === selectedTemplate)?.name})</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={downloading}
              className="px-5 py-2.5 bg-[#2F6F4E] hover:bg-[#25583E] text-white text-xs font-medium rounded transition-colors shadow-sm flex items-center gap-2"
            >
              {downloading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating PDF...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export &amp; Download PDF Dossier
                </span>
              )}
            </button>

            {onProceedToInterview && (
              <button
                type="button"
                onClick={onProceedToInterview}
                className="px-4 py-2.5 border border-[#D2D5C9] bg-white hover:bg-[#EEF0EA] text-[#1A2E22] text-xs font-medium rounded transition-colors"
              >
                Proceed to Interview &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplatePicker;

