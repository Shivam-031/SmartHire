import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface TemplateItem {
  id: number;
  name: string;
  code: string;
  badge: string;
  description: string;
  best_for: string;
  accent: string;
}

interface ResumeTemplatePickerProps {
  resumeId?: string | null;
  onProceedToInterview?: () => void;
  onSelectTemplate?: (templateId: number) => void;
}

export const ResumeTemplatePicker: React.FC<ResumeTemplatePickerProps> = ({
  resumeId,
  onProceedToInterview,
  onSelectTemplate,
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
      description:
        'Sophisticated typography pairing with deep purple accents, refined hairline dividers, and 98% ATS parsing compliance.',
      best_for: 'Technology & Product Management Roles',
      accent: '#7c3aed',
    },
    {
      id: 2,
      name: 'Classic Executive',
      code: 'TMPL-EXEC-02',
      badge: 'Traditional Formal',
      description:
        'Centered header format, bold corporate section dividers, and high-density chronology preferred by enterprise evaluators.',
      best_for: 'Executive Leadership, Legal & Regulatory Tracks',
      accent: '#3b82f6',
    },
    {
      id: 3,
      name: 'Minimal Compact',
      code: 'TMPL-MINIMAL-03',
      badge: 'Maximum ATS Density',
      description:
        'Monochromatic, zero-decorative layout optimized for raw keyword parsing, monospace dates, and rapid recruiter scanning.',
      best_for: 'High-Volume Enterprise ATS Pipelines',
      accent: '#22d3ee',
    },
  ];

  const handleSelect = (id: number) => {
    setSelectedTemplate(id);
    onSelectTemplate?.(id);
  };

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
          resume_id: resumeId || null,
        }),
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
    <div className="space-y-6 text-left animate-fadeIn select-none">
      {/* Header Container */}
      <div className="rounded-3xl p-6 sm:p-7 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-sm mb-2">
              <span className="w-2 h-2 rounded-full bg-[#c084fc] animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#c084fc] font-semibold">
                Dossier Publishing Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Select Resume Export Template
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Export high-fidelity A4 PDFs formatted for maximum ATS readability.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={downloading}
              onClick={handleExportPDF}
              className="btn-gradient-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>{downloading ? 'Compiling PDF...' : 'Export High-Res PDF'}</span>
            </button>
            {onProceedToInterview && (
              <button
                type="button"
                onClick={onProceedToInterview}
                className="btn-glass px-4 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                Proceed to Exam &rarr;
              </button>
            )}
          </div>
        </div>

        {downloadError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {downloadError}
          </div>
        )}

        {/* 3-Column Template Grid with Miniatures */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {templates.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;

            return (
              <div
                key={tmpl.id}
                onClick={() => handleSelect(tmpl.id)}
                className={`rounded-2xl p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-white/[0.05] border-transparent ring-2 ring-[#7c3aed] shadow-[0_0_25px_rgba(124,58,237,0.3)]'
                    : 'bg-white/[0.015] hover:bg-white/[0.03] border-white/[0.08] hover:border-white/[0.14]'
                }`}
              >
                {/* Paper Miniature Preview */}
                <div className="w-full h-44 rounded-xl bg-[#0d0c0c] border border-white/[0.08] p-3 flex flex-col justify-between shadow-inner relative overflow-hidden group">
                  <div className="space-y-1.5">
                    {/* Header bar */}
                    <div
                      className="h-2 rounded-full w-1/3"
                      style={{ backgroundColor: tmpl.accent }}
                    />
                    <div className="h-1 rounded-full bg-white/20 w-1/2" />
                    <div className="h-0.5 rounded-full bg-white/10 w-full mt-2" />
                  </div>

                  {/* Body lines simulation */}
                  <div className="space-y-1.5 my-auto">
                    <div className="h-1 rounded-full bg-white/15 w-4/5" />
                    <div className="h-1 rounded-full bg-white/10 w-3/4" />
                    <div className="h-1 rounded-full bg-white/15 w-5/6" />
                    <div className="h-1 rounded-full bg-white/10 w-2/3" />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
                    <span className="font-mono text-[9px] text-[#71717a]">{tmpl.code}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tmpl.accent }}
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-white">{tmpl.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-[#22d3ee]">
                      {tmpl.code}
                    </span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>
                  <span className="text-[11px] font-mono text-[#71717a] block pt-1">
                    Optimal: <span className="text-white/80">{tmpl.best_for}</span>
                  </span>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isSelected ? 'text-[#c084fc]' : 'text-[#71717a]'
                    }`}
                  >
                    {isSelected ? '✓ Selected Active' : 'Select Template'}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#c084fc] bg-[#c084fc]' : 'border-white/[0.2]'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplatePicker;
