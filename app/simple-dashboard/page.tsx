"use client";

import React from "react";

export default function SimpleParentDashboard() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f0f8ff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#2c5530', marginBottom: '2rem' }}>
          🎉 SUCCESS! Parent Dashboard
        </h1>
        
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          color: '#155724',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem'
        }}>
          <strong>✅ Login and redirect worked perfectly!</strong><br/>
          You have successfully logged in and been redirected to the parent dashboard.
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #bbdefb'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1976d2' }}>📅 Schedule</h3>
            <p>View upcoming scout meetings and events</p>
            <button style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View Schedule
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#f3e5f5',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e1bee7'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#7b1fa2' }}>💬 Messages</h3>
            <p>Communicate with scout leaders</p>
            <button style={{
              backgroundColor: '#7b1fa2',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View Messages
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#e8f5e8',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #c8e6c9'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2e7d32' }}>📊 Progress</h3>
            <p>Track your scout's achievements</p>
            <button style={{
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View Progress
            </button>
          </div>
        </div>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px'
        }}>
          <strong>🔧 Debug Info:</strong><br/>
          Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}<br/>
          Time: {new Date().toLocaleString()}<br/>
          Status: Dashboard loaded successfully
        </div>
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🚪 Logout (Back to Login)
          </button>
        </div>
      </div>
    </div>
  );
}
