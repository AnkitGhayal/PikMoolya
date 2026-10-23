import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getCropImage } from '../../components/ProductCard';
import {
  PlusCircle,
  TrendingUp,
  MapPin,
  Scale,
  Award,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [crops, setCrops] = useState<any[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('50');
  const [unit, setUnit] = useState<string>('quintal');
  const [expectedPrice, setExpectedPrice] = useState<string>('2450');
  const [minAcceptablePrice, setMinAcceptablePrice] = useState<string>('2300');
  const [location, setLocation] = useState<string>('Pune APMC Yard');
  const [description, setDescription] = useState<string>('Clean, uniform farm harvest stored in moisture-proof bags. Direct from farm.');
  const [measurementMethod, setMeasurementMethod] = useState<string>('Digital weighing scale');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    api.get('/crops')
      .then((res) => {
        const list = res.data?.crops || (Array.isArray(res.data) ? res.data : []);
        setCrops(list);
        if (list.length > 0) setSelectedCropId(list[0].id);
      })
      .catch((err) => {
        console.log('Error fetching crops:', err.message);
      });
  }, []);

  const selectedCrop = crops.find((c) => c.id === selectedCropId) || crops[0] || { name: 'Wheat', variety: 'Sharbati' };
  const cropName = selectedCrop?.name || 'Wheat';
  const previewImg = getCropImage(cropName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/products', {
        cropId: selectedCropId || selectedCrop?.id,
        cropName: cropName,
        quantity: Number(quantity),
        unit,
        expectedPrice: Number(expectedPrice),
        minAcceptablePrice: Number(minAcceptablePrice),
        location,
        description,
        measurementMethod,
      });

      success('Listing Published Successfully!', `${quantity} ${unit} of ${cropName} is now live on the marketplace.`);
      navigate('/farmer/products');
    } catch (err: any) {
      toastError('Failed to Publish Produce', err.message || 'Product creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '1080px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
        <Link to="/farmer/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={14} /> My Produce
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Add Produce Listing</span>
      </div>

      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
            List Farm Produce
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Publish verified crop inventory directly to institutional wholesale buyers
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '32px' }}>
        {/* Form Column */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Crop Name & Variety</label>
              <select
                className="form-select"
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                required
              >
                {crops.length > 0 ? (
                  crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.variety ? `— ${c.variety}` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="wheat">Wheat (Sharbati)</option>
                    <option value="rice">Rice (Basmati / Indrayani)</option>
                    <option value="jowar">Jowar (Sorghum)</option>
                    <option value="soybean">Soybean (Yellow)</option>
                    <option value="onion">Onion (Red)</option>
                    <option value="gram">Gram / Chana</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Total Quantity for Sale</label>
                <input
                  type="number"
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Unit</label>
                <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="quintal">Quintal</option>
                  <option value="kg">Kg</option>
                  <option value="ton">Ton</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Measurement Method</label>
              <select
                className="form-select"
                value={measurementMethod}
                onChange={(e) => setMeasurementMethod(e.target.value)}
              >
                <option value="Digital weighing scale">Digital weighing scale (Recommended)</option>
                <option value="APMC certified weighbridge">APMC certified weighbridge</option>
                <option value="Standard manual scale">Standard manual scale</option>
                <option value="Bag count calibration">Bag count calibration</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Expected Ask Price (₹/{unit})</label>
                <input
                  type="number"
                  className="form-input"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">
                  Private Floor (₹/{unit})
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', marginLeft: '4px' }}>
                    (Secret)
                  </span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={minAcceptablePrice}
                  onChange={(e) => setMinAcceptablePrice(e.target.value)}
                  placeholder="Minimum price"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location / APMC Mandi District</label>
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
              <label className="form-label">Description & Storage Condition</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe grain color, cleanliness, moisture level, harvest date..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <PlusCircle size={18} /> {loading ? 'Publishing Listing...' : 'Publish to Marketplace'}
            </button>
          </form>
        </div>

        {/* Live Marketplace Preview Column */}
        <div>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Live Marketplace Card Preview
            </span>
          </div>

          <div className="product-card" style={{ maxWidth: '380px' }}>
            <div className="product-img-wrapper">
              <img src={previewImg} alt="Preview" className="product-img" />
              <div className="product-category-chip">
                {selectedCrop?.variety || 'Agricultural Produce'}
              </div>
              <div className="product-grade-badge">
                <Award size={14} color="#15803d" />
                <span style={{ color: '#15803d' }}>Grade A</span>
                <span style={{ color: '#64748b', fontSize: '10px' }}>(85/100)</span>
              </div>
            </div>

            <div className="product-body">
              <h3 className="product-title">{cropName}</h3>
              <p className="product-location">
                <MapPin size={14} color="#64748b" /> {location || 'Pune APMC'}
              </p>

              <div className="product-price-section">
                <div className="price-main-row">
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>
                      Ask Price
                    </span>
                    <span className="seller-price">
                      ₹{Number(expectedPrice || 0).toLocaleString('en-IN')}{' '}
                      <span className="seller-price-unit">/{unit}</span>
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="ai-fair-pill">
                      <TrendingUp size={12} /> AI Fair: ₹{Math.round(Number(expectedPrice || 2500) * 0.98).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="product-availability-bar">
                <div className="availability-label">
                  <span>In Stock</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {quantity} {unit}
                  </span>
                </div>
                <div className="availability-track">
                  <div className="availability-fill" style={{ width: '85%' }} />
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '4px' }}>
                {description || 'Produce description will appear here.'}
              </div>
            </div>
          </div>

          {/* Pricing Tips Card */}
          <div
            className="card"
            style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <TrendingUp size={16} color="var(--primary)" />
              <strong style={{ fontSize: '13px', color: 'var(--primary-dark)' }}>
                Pricing Intelligence Tip
              </strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--primary-hover)', lineHeight: 1.5 }}>
              Listings within 3% of the AI benchmark fair price sell 3.8x faster and attract verified institutional millers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
