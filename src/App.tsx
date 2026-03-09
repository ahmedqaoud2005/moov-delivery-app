import React from 'react';

export default function App() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <h1>تطبيق Moov للتوصيل</h1>
      <p>مرحباً بك يا إرفات، التطبيق يعمل الآن بنجاح!</p>
      <img src="/logo.png" alt="Logo" style={{ width: '150px' }} />
      <div style={{ marginTop: '20px' }}>
        <button style={{ padding: '10px 20px', fontSize: '16px' }}>ابدأ الطلب الآن</button>
      </div>
    </div>
  );
}
