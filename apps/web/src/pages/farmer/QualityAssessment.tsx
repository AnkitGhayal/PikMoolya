import React, { useState } from 'react';
import api from '../../services/api';
import { QualityScoreCard } from '../../components/QualityScoreCard';
import { Award, Upload } from 'lucide-react';

export const QualityAssessment: React.FC = () => {
  const [cropName, setCropName] = useState<string>('Wheat');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/ai/quality-assessment', {
        cropName,
        imageBase64: base64,
      });
      setResult(res.data);
    } catch (err: any) {
      alert(`Assessment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20' }}>Crop Quality Assessment</h1>
          <p style={{ fontSize: '13px', color: '#718096' }}>Upload crop photographs for computer vision feature analysis</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <form onSubmit={handleAssess}>
            <div className="form-group">
              <label className="form-label">Crop Name</label>
              <input type="text" className="form-input" value={cropName} onChange={(e) => setCropName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Crop Photograph</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="form-input" />
            </div>

            {selectedImage ? (
              <div style={{ marginBottom: '16px' }}>
                <img src={selectedImage} alt="Crop Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px' }} />
              </div>
            ) : null}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              <Award size={16} /> {loading ? 'Analyzing Computer Vision Features...' : 'Run Quality Assessment'}
            </button>
          </form>
        </div>

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
            <div className="card text-center" style={{ padding: '36px' }}>
              <Award size={36} color="#A0AEC0" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: '#718096' }}>
                Select a crop photo and click "Run Quality Assessment" to generate visual quality grades.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
