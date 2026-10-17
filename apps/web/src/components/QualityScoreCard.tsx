import React from 'react';
import { Award, CheckCircle } from 'lucide-react';

interface QualityScoreCardProps {
  score: number;
  category: string;
  confidence?: number;
  detectedIssues?: string[];
  recommendation?: string;
  disclaimer?: string;
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({
  score,
  category,
  confidence = 86.0,
  detectedIssues = [],
  recommendation = 'STANDARD_MARKETABLE',
  disclaimer = 'AI Visual Quality Assessment for price discovery guidance. Visual assessment does not replace laboratory chemical testing.',
}) => {
  return (
    <div className="card" style={{ borderLeft: '4px solid #2B6CB0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Award size={22} color="#2B6CB0" />
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A202C' }}>AI Quality Assessment Report</h3>
          <span style={{ fontSize: '12px', color: '#718096' }}>Computer Vision Image Feature Analysis</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1, backgroundColor: '#EBF8FF', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#2B6CB0', textTransform: 'uppercase', fontWeight: 600 }}>
            Quality Score
          </span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2B6CB0', marginTop: '2px' }}>
            {score} / 100
          </div>
        </div>

        <div style={{ flex: 1, backgroundColor: '#F0FFF4', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#22543D', textTransform: 'uppercase', fontWeight: 600 }}>
            Quality Category
          </span>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#22543D', marginTop: '6px' }}>
            {category}
          </div>
        </div>
      </div>

      {detectedIssues.length > 0 ? (
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: '4px' }}>
            Visual Findings:
          </span>
          {detectedIssues.map((issue, idx) => (
            <div key={idx} style={{ fontSize: '13px', color: '#2D3748', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <CheckCircle size={14} color="#38A169" /> {issue}
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ fontSize: '11px', color: '#718096', fontStyle: 'italic', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
        {disclaimer}
      </div>
    </div>
  );
};
