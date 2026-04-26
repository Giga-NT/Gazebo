// src/pages/PrivacyPolicyPage.tsx
import React, { useEffect, useState } from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/privacy-policy.html')
      .then((response) => {
        if (!response.ok) throw new Error('Document not found');
        return response.text();
      })
      .then((data) => {
        setHtml(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load privacy policy:', error);
        setHtml('<div style="padding: 40px; text-align: center;"><h1>Ошибка загрузки документа</h1><p>Пожалуйста, попробуйте позже.</p></div>');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }} 
      style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.6',
        color: '#333'
      }} 
    />
  );
};

export default PrivacyPolicyPage;