import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '4px solid #E2E8F0',
          borderTopColor: '#1B5E20',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ marginTop: '12px', fontSize: '14px', color: '#4A5568', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
