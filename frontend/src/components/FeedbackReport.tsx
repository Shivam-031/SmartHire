import React from 'react';

interface FeedbackReportProps {
  relevanceScore: number;
  clarityScore: number;
  suggestions: string[];
  onContinue: () => void;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({
  relevanceScore,
  clarityScore,
  suggestions,
  onContinue,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#28a745'; // Green
    if (score >= 0.5) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      fontFamily: 'sans-serif',
      textAlign: 'left'
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Instant Feedback</h3>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Technical Relevance</span>
          <span style={{ fontWeight: 'bold' }}>{(relevanceScore * 100).toFixed(0)}%</span>
        </div>
        <div style={{ height: '12px', backgroundColor: '#e9ecef', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{
            width: `${relevanceScore * 100}%`,
            height: '100%',
            backgroundColor: getScoreColor(relevanceScore),
            transition: 'width 0.5s ease-in-out'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Communication Clarity</span>
          <span style={{ fontWeight: 'bold' }}>{(clarityScore * 100).toFixed(0)}%</span>
        </div>
        <div style={{ height: '12px', backgroundColor: '#e9ecef', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${clarityScore * 100}%`,
            height: '100%',
            backgroundColor: getScoreColor(clarityScore),
            transition: 'width 0.5s ease-in-out'
          }} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '0.8rem' }}>Tips for Improvement:</h4>
        <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.6' }}>
          {suggestions.map((s, i) => (
            <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>
          ))}
        </ul>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onContinue}
          style={{
            padding: '0.8rem 2rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Continue to Next Question
        </button>
      </div>
    </div>
  );
};

export default FeedbackReport;
