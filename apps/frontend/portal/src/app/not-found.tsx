import React from "react";

// Standard root-level 404 handler for Next.js 14.
// This is used when a route doesn't match any static or dynamic segment outside [locale].
export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '72px', color: '#1e293b', margin: '0' }}>404</h1>
          <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '24px' }}>Bridge not established.</p>
          <a href="/" style={{ 
            textDecoration: 'none', 
            color: 'white', 
            backgroundColor: '#064e3b', 
            padding: '12px 24px', 
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
            Return Home
          </a>
        </div>
      </body>
    </html>
  );
}
