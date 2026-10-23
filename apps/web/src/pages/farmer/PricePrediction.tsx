import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { PricePredictionCard } from '../../components/PricePredictionCard';
import { TrendingUp, Sparkles, Scale, Info, CheckCircle2 } from 'lucide-react';

export const PricePrediction: React.FC = () => {
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();
  const [cropName, setCropName] = useState<string>('Wheat');
  const [quantity, setQuantity] = useState<string>('100');
  const [location, setLocation] = useState<string>('Pune APMC Yard');
  const [historicalPrice, setHistoricalPrice] = useState<string>('2400');
  const [marketCondition, setMarketCondition] = useState<string>('HIGH_DEMAND');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const presets = [
    { crop: 'Wheat', price: '2400', loc: 'Pune APMC Yard' },
    { crop: 'Rice', price: '3150', loc: 'Nashik APMC' },
    { crop: 'Jowar', price: '2450', loc: 'Solapur APMC' },
    { crop: 'Soybean', price: '4300', loc: 'Latur APMC' },
    { crop: 'Gram', price: '5000', loc: 'Nagpur APMC' },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setCropName(p.crop);
    setHistoricalPrice(p.price);
    setLocation(p.loc);
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/ai/price-prediction', {
        cropName,
        quantity: Number(quantity),
        location,
        historicalPrice: Number(historicalPrice),
        marketCondition,
      });
      setResult(res.data);
      success('Fair Price Calculated!', `Estimated benchmark: ₹${res.data.predictedPrice.toLocaleString('en-IN')}/q for ${cropName}.`);
    } catch (err: any) {
      toastError('Calculation Failed', err.message || 'Could not calculate fair price.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '960px' }}>
      <div className="mb-6">
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t('roleFarmer')}
        </span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
          {t('priceDiscoveryTitle')}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {t('priceDiscoverySubtitle')}
        </p>
      </div>

      {/* Preset Quick Fill Pills */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '10px' }}>
          Quick Mandi Presets:
        </span>
        <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {presets.map((p) => (
            <button
              key={p.crop}
              type="button"
              onClick={() => applyPreset(p)}
              className={`filter-pill ${cropName === p.crop ? 'active' : ''}`}
            >
              {p.crop} (₹{p.price}/q)
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '32px' }}>
        {/* Form Inputs */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label className="form-label">Crop Name & Variety</label>
              <input
                type="text"
                className="form-input"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Wheat, Basmati Rice, Soybean"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Quantity (Quintals)</label>
              <input
                type="number"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">APMC Location / District</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune APMC Market Yard"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Historical APMC Mandi Benchmark (₹/quintal)</label>
              <input
                type="number"
                className="form-input"
                value={historicalPrice}
                onChange={(e) => setHistoricalPrice(e.target.value)}
                required
              />
              <span className="form-hint">
                Standard modal price recorded over past 30 days at nearest APMC.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Current Market Supply / Demand Tension</label>
              <select
                className="form-select"
                value={marketCondition}
                onChange={(e) => setMarketCondition(e.target.value)}
              >
                <option value="HIGH_DEMAND">High Demand (Bullish Market, Low Arrival)</option>
                <option value="NORMAL">Normal Supply & Demand Equilibrium</option>
                <option value="LOW_DEMAND">Excess Supply (Bearish Market, High Arrival)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <TrendingUp size={18} /> {loading ? t('loading') : t('calculateFairPrice')}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div>
          {result ? (
            <PricePredictionCard
              cropName={cropName}
              predictedPrice={result.predictedPrice}
              historicalPrice={Number(historicalPrice)}
              marketCondition={marketCondition}
              disclaimer={result.disclaimer}
            />
          ) : (
            <div
              className="card text-center"
              style={{
                padding: '48px 24px',
                border: '2px dashed var(--border-default)',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Scale size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Awaiting Inputs
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto' }}>
                Fill out the market parameters and tap "Calculate Benchmark Fair Price" to generate the scientific fair value recommendation.
              </p>
            </div>
          )}

          {/* Research Equation Info Box */}
          <div
            className="card"
            style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Info size={16} color="var(--primary)" />
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                About the Pricing Equation
              </strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The model computes fair price as a multi-variable function where C represents crop traits, L geographical logistics cost, Q laboratory/CV quality grade, M seasonal market demand, and H historical modal transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
