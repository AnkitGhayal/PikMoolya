import React from 'react';
import { Filter } from 'lucide-react';

interface FilterPanelProps {
  cropName: string;
  setCropName: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  cropName,
  setCropName,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onReset,
}) => {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Filter size={18} color="#1B5E20" />
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1A202C' }}>Filters & Sorting</h4>
      </div>

      <div className="form-group">
        <label className="form-label">Crop Name</label>
        <select className="form-select" value={cropName} onChange={(e) => setCropName(e.target.value)}>
          <option value="">All Crops</option>
          <option value="Wheat">Wheat</option>
          <option value="Rice">Rice</option>
          <option value="Onion">Onion</option>
          <option value="Tomato">Tomato</option>
          <option value="Soybean">Soybean</option>
          <option value="Cotton">Cotton</option>
          <option value="Gram">Gram</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Price Range (₹/quintal)</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            className="form-input"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            className="form-input"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Sort Products</label>
        <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="quality">Quality Score</option>
        </select>
      </div>

      <button onClick={onReset} className="btn-secondary" style={{ width: '100%', fontSize: '13px' }}>
        Reset Filters
      </button>
    </div>
  );
};
