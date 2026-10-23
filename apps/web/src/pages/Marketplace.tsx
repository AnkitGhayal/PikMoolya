import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard, Product } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Store, Sparkles, AlertCircle, SlidersHorizontal, RefreshCw } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [cropName, setCropName] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    { label: 'All Produce', value: 'ALL', crop: '' },
    { label: '🌾 Wheat', value: 'WHEAT', crop: 'Wheat' },
    { label: '🍚 Rice & Paddy', value: 'RICE', crop: 'Rice' },
    { label: '🌿 Jowar (Sorghum)', value: 'JOWAR', crop: 'Jowar' },
    { label: '🌱 Soybean', value: 'SOYBEAN', crop: 'Soybean' },
    { label: '🧅 Onion & Veg', value: 'ONION', crop: 'Onion' },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { search, cropName, sortBy };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.get('/products', { params });
      setProducts(res.data.data?.products || []);
    } catch (err: any) {
      console.log('Error fetching products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, cropName, minPrice, maxPrice, sortBy]);

  const handleCategoryClick = (cat: typeof categories[0]) => {
    setActiveCategory(cat.value);
    setCropName(cat.crop);
  };

  const handleReset = () => {
    setSearch('');
    setCropName('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setActiveCategory('ALL');
  };

  return (
    <div className="container" style={{ padding: '36px 20px 64px 20px' }}>
      {/* Marketplace Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Store size={22} color="var(--primary)" />
          <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.06em' }}>
            Live Agricultural Exchange
          </span>
        </div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('marketplaceTitle')}
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {t('marketplaceSubtitle')}
            </p>
          </div>
          <button onClick={fetchProducts} className="btn-secondary btn-sm" title={t('refresh')}>
            <RefreshCw size={14} /> {t('refresh')}
          </button>
        </div>
      </div>

      {/* Quick Category Filter Pills */}
      <div className="filter-pills">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryClick(cat)}
            className={`filter-pill ${activeCategory === cat.value ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '28px' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('searchPlaceholder')}
          onClear={() => setSearch('')}
        />
      </div>

      {/* Main Content Layout */}
      <div className="marketplace-layout">
        {/* Desktop Filter Sidebar */}
        <div className="marketplace-sidebar">
          <FilterPanel
            cropName={cropName}
            setCropName={(val) => {
              setCropName(val);
              const matching = categories.find((c) => c.crop.toLowerCase() === val.toLowerCase());
              setActiveCategory(matching ? matching.value : 'CUSTOM');
            }}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onReset={handleReset}
          />
        </div>

        {/* Listings Grid */}
        <div className="marketplace-content">
          <div className="flex-between mb-4">
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {loading ? t('loading') : `${t('activeListings')}: ${products.length}`}
            </span>
          </div>

          {loading ? (
            <LoadingSpinner message={t('loading')} />
          ) : products.length === 0 ? (
            <div
              className="card text-center"
              style={{
                padding: '64px 24px',
                border: '2px dashed var(--border-default)',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Store size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {t('noListingsFound')}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                {t('marketplaceSubtitle')}
              </p>
              <button onClick={handleReset} className="btn-secondary">
                {t('clearFilters')}
              </button>
            </div>
          ) : (
            <div className="product-grid animate-fade-in">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
