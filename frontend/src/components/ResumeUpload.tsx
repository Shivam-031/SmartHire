import React, { useState } from 'react';

type Mode = 'file' | 'text';

const ResumeUpload: React.FC = () => {
  const [mode, setMode] = useState<Mode>('file');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSkills([]);

    try {
      if (mode === 'file') {
        if (!file) throw new Error('Please select a file first');

        const formData = new FormData();
        formData.append('file', file);
        // For demo, we don't send user_id and let backend use default

        const response = await fetch('http://localhost:5000/api/resume/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setSkills(data.extracted_skills);
      } else {
        if (!text.trim()) throw new Error('Please enter some text');

        const response = await fetch('http://localhost:5000/api/resume/manual-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Processing failed');
        }

        setSkills(data.extracted_skills);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Resume Skill Extractor</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => { setMode('file'); setError(null); setSkills([]); }}
          style={{ marginRight: '10px', fontWeight: mode === 'file' ? 'bold' : 'normal' }}
        >
          Upload File
        </button>
        <button
          onClick={() => { setMode('text'); setError(null); setSkills([]); }}
          style={{ fontWeight: mode === 'text' ? 'bold' : 'normal' }}
        >
          Paste Text
        </button>
      </div>

      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        {mode === 'file' ? (
          <div>
            <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
            <p style={{ fontSize: '0.8rem', color: '#666' }}>Accepted formats: .pdf, .docx (Max 5MB)</p>
          </div>
        ) : (
          <div>
            <textarea
              rows={10}
              style={{ width: '100%', marginBottom: '10px' }}
              placeholder="Paste your resume text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : 'Extract Skills'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: '1rem', padding: '1rem', backgroundColor: '#fee', border: '1px solid red', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {skills.length > 0 ? (
        <div style={{ marginTop: '2rem' }}>
          <h3>Extracted Skills:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {skills.map((skill, idx) => (
              <span key={idx} style={{ padding: '5px 10px', backgroundColor: '#e0e0e0', borderRadius: '15px', fontSize: '0.9rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : (
        !loading && (
          <div style={{ marginTop: '2rem', color: '#666', fontStyle: 'italic' }}>
            No skills were extracted from the resume.
          </div>
        )
      )}
    </div>
  );
};

export default ResumeUpload;
