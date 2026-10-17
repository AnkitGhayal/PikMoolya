import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface PricePredictionCardProps {
  cropName: string;
  predictedPrice: number;
  currency?: string;
  historicalPrice?: number;
  marketCondition?: string;
  disclaimer?: string;
}

export const PricePredictionCard: React.FC<PricePredictionCardProps> = ({
  cropName,
  predictedPrice,
  currency = 'INR',
  historicalPrice,
  marketCondition = 'NORMAL',
  disclaimer = 'Estimated fair price derived from Pf = f(C, L, Q, M, H). Actual market prices depend on party negotiations.',
}) => {
  return (
    <div className="card" style={{ borderLeft: '4px solid #1B5E20' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <TrendingUp size={22} color="#1B5E20" />
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A202C' }}>AI Estimated Fair Price</h3>
          <span style={{ fontSize: '12px', color: '#718096' }}>{cropName} Market Benchmark</span>
        </div>
      </div>

      <div style={{ backgroundColor: '#E8F5E9', borderRadius: '6px', padding: '16px', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: '#2E7D32', textTransform: 'uppercase', fontWeight: 600 }}>
          Estimated Fair Price
        </span>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#1B5E20', marginTop: '4px' }}>
          ₹{predictedPrice.toLocaleString('en-IN')} <span style={{ fontSize: '14px', fontWeight: 500 }}>per quintal</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', fontSize: '13px' }}>
        <div>
          <span style={{ color: '#718096' }}>Historical APMC Price:</span>
          <strong style={{ display: 'block', color: '#2D3748' }}>₹{historicalPrice?.toLocaleString('en-IN') || '2,400'} / quintal</strong>
        </div>
        <div>
          <span style={{ color: '#718096' }}>Market Condition:</span>
          <strong style={{ display: 'block', color: '#2D3748' }}>{marketCondition}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>
        <AlertCircle size={16} color="#718096" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{disclaimer}</span>
      </div>
    </div>
  );
};
