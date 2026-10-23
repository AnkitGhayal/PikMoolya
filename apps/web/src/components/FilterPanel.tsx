import React from 'react';
import { Filter, RotateCcw, SlidersHorizontal, Award, ArrowUpDown } from 'lucide-react';

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
  const hasActiveFilters = Boolean(cropName || minPrice || maxPrice || sortBy !== 'newest');

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', position: 'sticky', top: '92px' }}>
      <div className="flex-between mb-4" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Filters & Sorting
          </h4>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="btn-secondary btn-sm"
            style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-muted)' }}
            title="Clear all filters"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Crop Name Filter */}
      <div className="form-group">
        <label className="form-label">Crop Type</label>
        <select
          className="form-select"
          value={cropName}
          onChange={(e) => setCropName(e.target.value)}
        >
          <option value="">All Crop Categories</option>
          <option value="Wheat">Wheat (Gehun)</option>
          <option value="Rice">Rice (Chawal / Paddy)</option>
          <option value="Jowar">Jowar (Sorghum)</option>
          <option value="Soybean">Soybean</option>
          <option value="Bajra">Bajra (Pearl Millet)</option>
          <option value="Cotton">Cotton (Kapas)</option>
          <option value="Gram">Gram / Chana (Chickpeas)</option>
          <option value="Onion">Onion (Pyaz)</option>
          <option value="Tomato">Tomato</option>
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="form-group">
        <label className="form-label">Price Range (₹ / quintal)</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="number"
            className="form-input"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span style={{ color: 'var(--text-light)', fontSize: '13px' }}>to</span>
          <input
            type="number"
            className="form-input"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Quick Price Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => { setMinPrice(''); setMaxPrice('2000'); }}
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: maxPrice === '2000' ? 'var(--primary-light)' : 'var(--bg-subtle)',
              color: maxPrice === '2000' ? 'var(--primary)' : 'var(--text-muted)',
              border: '1px solid var(--border-default)',
            }}
          >
            &lt; ₹2,000
          </button>
          <button
            type="button"
            onClick={() => { setMinPrice('2000'); setMaxPrice('3000'); }}
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: minPrice === '2000' ? 'var(--primary-light)' : 'var(--bg-subtle)',
              color: minPrice === '2000' ? 'var(--primary)' : 'var(--text-muted)',
              border: '1px solid var(--border-default)',
            }}
          >
            ₹2,000 - ₹3,000
          </button>
          <button
            type="button"
            onClick={() => { setMinPrice('3000'); setMaxPrice(''); }}
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: minPrice === '3000' ? 'var(--primary-light)' : 'var(--bg-subtle)',
              color: minPrice === '3000' ? 'var(--primary)' : 'var(--text-muted)',
              border: '1px solid var(--border-default)',
            }}
          >
            &gt; ₹3,000
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="form-group" style={{ marginBottom: '8px' }}>
        <label className="form-label">Sort By</label>
        <select
          className="form-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest Harvest Listings</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="quality">Quality Score (Highest First)</option>
        </select>
      </div>
    </div>
  );
};
