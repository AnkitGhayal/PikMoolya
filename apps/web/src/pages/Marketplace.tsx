import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ProductCard, Product } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [cropName, setCropName] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

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

  const handleReset = () => {
    setSearch('');
    setCropName('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1B5E20' }}>Agricultural Marketplace</h1>
        <p style={{ fontSize: '14px', color: '#718096' }}>Browse verified farmer produce with AI estimated fair prices</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ width: '280px', flexShrink: 0 }}>
          <FilterPanel
            cropName={cropName}
            setCropName={setCropName}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onReset={handleReset}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '20px' }}>
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {loading ? (
            <LoadingSpinner message="Loading marketplace listings..." />
          ) : products.length === 0 ? (
            <div className="card text-center" style={{ padding: '48px' }}>
              <p style={{ fontSize: '16px', color: '#718096' }}>No products match your search or filter criteria.</p>
              <button onClick={handleReset} className="btn-secondary" style={{ marginTop: '16px' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid-3">
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
