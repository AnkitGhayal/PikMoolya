import React, { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, Copy, Check, Scale, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
  historicalPrice = 2400,
  marketCondition = 'NORMAL',
  disclaimer = 'Calculated via Pf = f(C, L, Q, M, H). Historical APMC mandi benchmarks combined with live seasonal demand coefficients.',
}) => {
  const { info } = useToast();
  const [copied, setCopied] = useState(false);

  const priceDiff = predictedPrice - historicalPrice;
  const pctDiff = historicalPrice > 0 ? ((priceDiff / historicalPrice) * 100).toFixed(1) : '0';
  const isPositive = priceDiff >= 0;

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(`₹${predictedPrice} per quintal`);
    setCopied(true);
    info('Price Copied', `Benchmark of ₹${predictedPrice}/q copied to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card animate-fade-in" style={{ borderLeft: '4px solid var(--primary)', padding: '28px' }}>
      <div className="flex-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              AI Estimated Fair Price
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {cropName} APMC Mandi Benchmark
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn-secondary btn-sm"
          title="Copy benchmark price"
        >
          {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Main Benchmark Price Display */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          marginBottom: '20px',
          border: '1px solid var(--primary-border)',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--primary-hover)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
          Recommended Ask Benchmark
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
            ₹{predictedPrice.toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary-hover)' }}>
            / quintal
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isPositive ? '#bbf7d0' : '#fed7aa',
              color: isPositive ? '#166534' : '#9a3412',
            }}
          >
            {isPositive ? `+${pctDiff}%` : `${pctDiff}%`} vs APMC 30-Day Avg
          </span>
          <span style={{ fontSize: '12px', color: 'var(--primary-hover)' }}>
            (₹{historicalPrice.toLocaleString('en-IN')} base)
          </span>
        </div>
      </div>

      {/* 5-Factor Equation Influence Breakdown */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
          Model Pricing Coefficients (Pf = f(C, L, Q, M, H))
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div className="flex-between" style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Crop Variety Premium (C)</span>
            <strong style={{ color: 'var(--primary)' }}>+2.5%</strong>
          </div>
          <div className="flex-between" style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>APMC Distance & Logistics (L)</span>
            <strong style={{ color: 'var(--text-primary)' }}>Standard</strong>
          </div>
          <div className="flex-between" style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Assumed Visual Quality (Q)</span>
            <strong style={{ color: 'var(--ai-blue)' }}>Grade A Benchmark</strong>
          </div>
          <div className="flex-between" style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Market Supply/Demand (M)</span>
            <strong style={{ color: marketCondition === 'HIGH_DEMAND' ? 'var(--primary)' : 'var(--text-secondary)' }}>
              {marketCondition}
            </strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--border-default)', paddingTop: '12px' }}>
        <AlertCircle size={16} color="var(--text-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{disclaimer}</span>
      </div>
    </div>
  );
};
