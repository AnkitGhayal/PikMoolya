import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getCropImage } from '../../components/ProductCard';
import { PlusCircle, Edit, Package, MapPin, Scale, RefreshCw, ExternalLink } from 'lucide-react';

export const FarmerProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/produce');
      setProducts(res.data || []);
    } catch (err: any) {
      console.log('Error loading farmer produce:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const totalQuintals = products.reduce((acc, p) => acc + Number(p.remainingQuantity ?? p.quantity ?? 0), 0);
  const estimatedValue = products.reduce((acc, p) => {
    const qty = Number(p.remainingQuantity ?? p.quantity ?? 0);
    const prc = Number(p.expectedPrice || 2450);
    return acc + (qty * prc);
  }, 0);

  return (
    <div className="page-container animate-fade-in">
      <div className="flex-between mb-6" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Inventory Management
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            My Produce Listings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Track and manage your listed agricultural crops on the live marketplace
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchMyProducts} className="btn-secondary btn-sm" title="Refresh products">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/farmer/products/add" className="btn-primary">
            <PlusCircle size={16} /> Add Produce
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Listings</div>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-green">
            <Package size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Available Inventory</div>
            <div className="stat-value">{totalQuintals} <span style={{ fontSize: '14px', fontWeight: 600 }}>quintals</span></div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Scale size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Estimated Gross Market Value</div>
            <div className="stat-value" style={{ color: 'var(--primary-dark)' }}>₹{estimatedValue.toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <Package size={22} />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your produce inventory..." />
      ) : products.length === 0 ? (
        <div
          className="card text-center"
          style={{
            padding: '64px 24px',
            border: '2px dashed var(--border-default)',
            backgroundColor: '#ffffff',
          }}
        >
          <Package size={40} color="var(--text-light)" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No produce listings yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
            List your harvest with AI price floor protection and reach verified wholesale buyers directly.
          </p>
          <Link to="/farmer/products/add" className="btn-primary">
            <PlusCircle size={16} /> Add Your First Crop Listing
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Quantity Available</th>
                  <th>Ask Price</th>
                  <th>Location</th>
                  <th>Measurement</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  const cropName = item.crop?.name || 'Crop';
                  const img = getCropImage(cropName);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={img}
                            alt={cropName}
                            style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '15px' }}>{cropName}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                              {item.crop?.variety || 'Standard Variety'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {item.remainingQuantity ?? item.quantity} {item.unit || 'quintal'}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary-dark)', fontSize: '15px' }}>
                          ₹{(item.expectedPrice || 2450).toLocaleString('en-IN')}
                        </strong>{' '}
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{item.unit || 'quintal'}</span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                          <MapPin size={13} color="var(--text-muted)" /> {item.locationApproximate || 'Pune APMC'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {item.measurementMethod || 'Digital Scale'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {item.status || 'PUBLISHED'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Link
                            to={`/product/${item.id}`}
                            className="btn-secondary btn-sm"
                            title="View on marketplace"
                          >
                            <ExternalLink size={13} /> View
                          </Link>
                          <Link
                            to={`/farmer/products/${item.id}/edit`}
                            className="btn-secondary btn-sm"
                            title="Edit listing details"
                          >
                            <Edit size={13} /> Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
