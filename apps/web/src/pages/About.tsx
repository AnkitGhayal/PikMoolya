import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="container" style={{ padding: '48px 20px', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1B5E20', marginBottom: '16px' }}>
        About PikMoolya
      </h1>
      <p style={{ fontSize: '16px', color: '#4A5568', lineHeight: 1.6, marginBottom: '24px' }}>
        PikMoolya is an AI-based fair price discovery and direct market access platform for farmers.
        Built upon agricultural research, the system addresses price information asymmetry between smallholder farmers and institutional buyers.
      </p>

      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1A202C' }}>
          Conceptual Fair Price Model
        </h2>
        <p style={{ fontSize: '14px', color: '#4A5568', marginBottom: '12px' }}>
          The fair price prediction function is defined as:
        </p>
        <div style={{ backgroundColor: '#E8F5E9', padding: '16px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, color: '#1B5E20', textAlign: 'center' }}>
          P_f = f(C, L, Q, M, H)
        </div>
        <ul style={{ fontSize: '14px', color: '#4A5568', marginTop: '12px', paddingLeft: '20px', lineHeight: 1.8 }}>
          <li><strong>C</strong> = Crop characteristics and variety</li>
          <li><strong>L</strong> = Geographical location and APMC market proximity</li>
          <li><strong>Q</strong> = Measured quantity and visual quality assessment grade</li>
          <li><strong>M</strong> = Current market demand and seasonal supply factors</li>
          <li><strong>H</strong> = Historical price data trends</li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1A202C' }}>
          Computer Vision Quality Assessment Pipeline
        </h2>
        <p style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.6 }}>
          PikMoolya integrates real image feature extraction analyzing luminance, contrast, edge gradient (blur detection), surface discoloration, and uniformity. The architecture supports transfer learning models (MobileNetV3 / EfficientNet) with fallback development interfaces.
        </p>
      </div>
    </div>
  );
};
