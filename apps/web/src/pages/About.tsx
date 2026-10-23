import React from 'react';
import { 
  Sprout, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  Eye, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
          <Sparkles size={16} /> Research-Backed Agricultural Intelligence
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px' }}>
          Democratizing Agricultural Commerce Through Algorithmic Fairness
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          PikMoolya eliminates price asymmetry in agricultural trade. By synthesizing real-time APMC mandi feeds, computer vision produce grading, and econometric supply-demand models, we empower farmers to negotiate with confidence and trade directly with verified buyers.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <TrendingUp size={24} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            APMC Price Transparency
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            Live aggregation from state APMC mandi yards prevents distress selling by revealing actual daily wholesale rates and price bands before harvest dispatch.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Eye size={24} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Computer Vision QA
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            Objective visual quality scoring analyzes produce color vibrancy, grain uniformity, and surface blemishes, replacing arbitrary middleman deductions with verified scientific grades.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Direct Escrow Settlement
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            Digital contracts lock buyer funds in escrow prior to pickup. Payment releases seamlessly upon delivery sign-off, eliminating delayed payouts and defaults.
          </p>
        </div>
      </div>

      {/* The Fair Price Discovery Model */}
      <div className="card" style={{ padding: '32px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Scale size={24} color="#15803d" />
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            The Algorithmic Fair Price Function
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
          Rather than relying on informal cartel quotes, PikMoolya determines produce baseline valuation using an econometric multi-variable formulation:
        </p>

        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d', fontFamily: 'monospace', letterSpacing: '1px' }}>
            P_f = β₀ + β_c·C + β_l·L + β_q·Q + β_m·M + β_h·H
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>
            Target Equilibrium Price per Quintal (₹/qtl)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#ffffff' }}>
            <strong style={{ fontSize: '13px', color: '#15803d', display: 'block', marginBottom: '4px' }}>C • Crop Characteristics</strong>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Grain variety, certified moisture level, and harvest seasonality coefficients.</p>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#ffffff' }}>
            <strong style={{ fontSize: '13px', color: '#15803d', display: 'block', marginBottom: '4px' }}>L • Location & Logistics</strong>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Geographic haulage radius to terminal consumption hubs and freight tariffs.</p>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#ffffff' }}>
            <strong style={{ fontSize: '13px', color: '#15803d', display: 'block', marginBottom: '4px' }}>Q • Visual Quality Score</strong>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Normalized 0.0 to 1.0 index from AI computer vision surface inspection.</p>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#ffffff' }}>
            <strong style={{ fontSize: '13px', color: '#15803d', display: 'block', marginBottom: '4px' }}>M • Market Demand Index</strong>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Live mandi arrivals vs institutional buyer procurement bid density.</p>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#ffffff' }}>
            <strong style={{ fontSize: '13px', color: '#15803d', display: 'block', marginBottom: '4px' }}>H • Historical Modal Trend</strong>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>30-day exponential moving average across benchmark APMC market yards.</p>
          </div>
        </div>
      </div>

      {/* Comparison: Traditional Mandi vs PikMoolya */}
      <div className="card" style={{ padding: '32px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
          Comparative Value Delivery
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', color: '#475569' }}>Dimension</th>
                <th style={{ padding: '12px 16px', color: '#dc2626' }}>Traditional Mandi Intermediary</th>
                <th style={{ padding: '12px 16px', color: '#15803d' }}>PikMoolya Platform</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>Brokerage & Commissions</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={16} color="#dc2626" /> 12% - 22% cuts via adatiyas & agents
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#15803d', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#15803d" /> 0% intermediary broker cut
                  </div>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>Quality Grading</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={16} color="#dc2626" /> Subjective trader visual inspection
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#15803d', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#15803d" /> Scientific Computer Vision scoring
                  </div>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>Payment Settlement</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={16} color="#dc2626" /> 15 to 45 days delayed credit cycles
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#15803d', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#15803d" /> Escrow protected instant payout
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>Market Discovery</td>
                <td style={{ padding: '14px 16px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={16} color="#dc2626" /> Limited to 1 local yard radius
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#15803d', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#15803d" /> Multi-district institutional buyer network
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action Footer */}
      <div style={{ backgroundColor: '#15803d', borderRadius: '16px', padding: '36px', color: '#ffffff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>
          Ready to experience fair agricultural trade?
        </h2>
        <p style={{ fontSize: '14px', color: '#bbf7d0', maxWidth: '540px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
          Join thousands of progressive farmers and certified institutional buyers on Maharashtra's premier smart mandi platform.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/marketplace" className="btn-secondary" style={{ backgroundColor: '#ffffff', color: '#15803d', fontWeight: 700 }}>
            Explore Live Produce Marketplace
          </Link>
          <Link to="/farmer/prediction" className="btn-primary" style={{ backgroundColor: '#166534', border: '1px solid #22c55e', color: '#ffffff' }}>
            Run Algorithmic Price Predictor
          </Link>
        </div>
      </div>
    </div>
  );
};
