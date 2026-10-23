import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { QualityScoreCard } from '../../components/QualityScoreCard';
import {
  Award,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const QualityAssessment: React.FC = () => {
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();
  const [cropName, setCropName] = useState<string>('Wheat');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Sample photo presets for quick verification
  const sampleCrops = [
    {
      name: 'Wheat',
      url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600',
      label: 'Golden Wheat Harvest',
    },
    {
      name: 'Rice',
      url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600',
      label: 'Paddy Rice Sample',
    },
    {
      name: 'Soybean',
      url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Soybeans.jpg',
      label: 'Organic Soybean Batch',
    },
    {
      name: 'Jowar',
      url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
      label: 'White Sorghum / Jowar',
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setSelectedImage(b64);
        setBase64(b64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof sampleCrops[0]) => {
    setCropName(sample.name);
    setSelectedImage(sample.url);
    // Convert sample url to simple base64 placeholder or send cropName
    setBase64('');
  };

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/ai/quality-assessment', {
        cropName,
        imageBase64: base64 || undefined,
      });
      setResult(res.data);
      success('Quality Assessment Complete!', `Certified as ${res.data.qualityCategory} (Score: ${res.data.qualityScore}/100)`);
    } catch (err: any) {
      toastError('Assessment Failed', err.message || 'Computer vision analysis could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '980px' }}>
      <div className="mb-6">
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ai-blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t('roleFarmer')}
        </span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
          {t('qualityAssessmentTitle')}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {t('qualityAssessmentSubtitle')}
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '32px' }}>
        {/* Upload Column */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleAssess}>
            <div className="form-group">
              <label className="form-label">Crop Name</label>
              <select
                className="form-select"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
              >
                <option value="Wheat">Wheat (Gehun)</option>
                <option value="Rice">Rice (Chawal / Paddy)</option>
                <option value="Jowar">Jowar (Sorghum)</option>
                <option value="Soybean">Soybean</option>
                <option value="Gram">Gram / Chana</option>
                <option value="Onion">Onion</option>
                <option value="Tomato">Tomato</option>
              </select>
            </div>

            {/* Quick Sample Presets */}
            <div className="form-group">
              <label className="form-label">Quick Test Photos</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {sampleCrops.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleSelectSample(s)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: selectedImage === s.url ? 'var(--primary-light)' : 'var(--bg-subtle)',
                      border: `1.5px solid ${selectedImage === s.url ? 'var(--primary)' : 'var(--border-default)'}`,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={s.url}
                      alt={s.name}
                      style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Sample Photo</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div className="form-group">
              <label className="form-label">Or Upload Your Own Farm Photograph</label>
              <div
                style={{
                  border: '2px dashed var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
                <Camera size={28} color="var(--primary)" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Click to select photo or drag here
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  PNG, JPG up to 10MB. Natural daylight lighting recommended.
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {selectedImage && (
              <div style={{ marginBottom: '20px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                <img
                  src={selectedImage}
                  alt="Crop Preview"
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <Award size={18} /> {loading ? t('analyzingInProgress') : t('analyzeQualityBtn')}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div>
          {result ? (
            <QualityScoreCard
              score={result.qualityScore}
              category={result.qualityCategory}
              confidence={result.confidence}
              detectedIssues={result.detectedIssues}
              recommendation={result.recommendation}
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
                  backgroundColor: 'var(--ai-blue-light)',
                  color: 'var(--ai-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                No Quality Certificate Yet
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto' }}>
                Select a sample photo or upload your crop grains photo and tap "Run Quality Assessment" to generate your verifiable grade report.
              </p>
            </div>
          )}

          {/* Photo Best Practices */}
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
              <ShieldCheck size={16} color="var(--primary)" />
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                Best Practices for Accurate Quality Scoring
              </strong>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--primary)" /> Spread grains evenly on a plain white or neutral surface
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--primary)" /> Ensure bright daylight without harsh shadows or flash reflections
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--primary)" /> Keep camera 15-20 cm directly above the grains
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
