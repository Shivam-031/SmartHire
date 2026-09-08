import React from 'react';
import ResumeUpload from './components/ResumeUpload';

const App = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>SmartHire AI</h1>
      <p>Upload your resume to get started with AI-powered interview prep.</p>
      <ResumeUpload />
    </div>
  )
}

export default App
