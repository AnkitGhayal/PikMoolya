import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState<any[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('100');
  const [unit, setUnit] = useState<string>('quintal');
  const [expectedPrice, setExpectedPrice] = useState<string>('2500');
  const [minAcceptablePrice, setMinAcceptablePrice] = useState<string>('2350');
  const [location, setLocation] = useState<string>('Pune district');
  const [description, setDescription] = useState<string>('');
  const [measurementMethod, setMeasurementMethod] = useState<string>('Digital weighing scale');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    api.get('/crops')
      .then((res) => {
        const list = res.data || [];
        setCrops(list);
        if (list.length > 0) setSelectedCropId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/products', {
        cropId: selectedCropId,
        quantity: Number(quantity),
        unit,
        expectedPrice: Number(expectedPrice),
        minAcceptablePrice: Number(minAcceptablePrice),
        location,
        description,
        measurementMethod,
      });

      alert('Produce listing published successfully!');
      navigate('/farmer/products');
    } catch (err: any) {
      alert(`Product creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '650px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20', marginBottom: '16px' }}>Add Produce Product</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Crop</label>
            <select className="form-select" value={selectedCropId} onChange={(e) => setSelectedCropId(e.target.value)}>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.variety ? `(${c.variety})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Quantity</label>
              <input type="number" className="form-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
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
            <select className="form-select" value={measurementMethod} onChange={(e) => setMeasurementMethod(e.target.value)}>
              <option value="Digital weighing scale">Digital weighing scale</option>
              <option value="Weighing scale">Weighing scale</option>
              <option value="Manual calculation">Manual calculation</option>
              <option value="Estimated quantity">Estimated quantity</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Expected Price (₹/{unit})</label>
              <input type="number" className="form-input" value={expectedPrice} onChange={(e) => setExpectedPrice(e.target.value)} required />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Private Price Floor (₹/{unit})</label>
              <input type="number" className="form-input" value={minAcceptablePrice} onChange={(e) => setMinAcceptablePrice(e.target.value)} placeholder="Private floor" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / APMC District</label>
            <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Produce Description & Storage Info</label>
            <textarea className="form-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe crop quality, grain size, moisture level..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Publishing...' : 'Publish Product to Marketplace'}
          </button>
        </form>
      </div>
    </div>
  );
};
