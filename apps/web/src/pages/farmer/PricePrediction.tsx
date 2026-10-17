import React, { useState } from 'react';
import api from '../../services/api';
import { PricePredictionCard } from '../../components/PricePredictionCard';
import { TrendingUp } from 'lucide-react';

export const PricePrediction: React.FC = () => {
  const [cropName, setCropName] = useState<string>('Wheat');
  const [quantity, setQuantity] = useState<string>('100');
  const [location, setLocation] = useState<string>('Pune district');
  const [historicalPrice, setHistoricalPrice] = useState<string>('2400');
  const [marketCondition, setMarketCondition] = useState<string>('HIGH_DEMAND');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
    } catch (err: any) {
      alert(`Prediction request failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20' }}>AI Fair Price Discovery</h1>
          <p style={{ fontSize: '13px', color: '#718096' }}>Calculate benchmark prices based on $P_f = f(C, L, Q, M, H)$</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label className="form-label">Crop Name</label>
              <input type="text" className="form-input" value={cropName} onChange={(e) => setCropName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity (Quintals)</label>
              <input type="number" className="form-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">APMC Location / District</label>
              <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Historical APMC Benchmark (₹)</label>
              <input type="number" className="form-input" value={historicalPrice} onChange={(e) => setHistoricalPrice(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Current Market Condition</label>
              <select className="form-select" value={marketCondition} onChange={(e) => setMarketCondition(e.target.value)}>
                <option value="HIGH_DEMAND">High Demand (Bullish Market)</option>
                <option value="NORMAL">Normal Supply/Demand</option>
                <option value="LOW_DEMAND">Excess Supply (Bearish Market)</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              <TrendingUp size={16} /> {loading ? 'Calculating...' : 'Calculate Fair Price'}
            </button>
          </form>
        </div>

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
            <div className="card text-center" style={{ padding: '36px' }}>
              <TrendingUp size={36} color="#A0AEC0" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: '#718096' }}>
                Fill out the market inputs and tap "Calculate Fair Price" to generate AI benchmark price discovery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
