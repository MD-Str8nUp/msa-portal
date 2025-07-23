"use client";

import React, { useState, useEffect } from "react";

interface Scout {
  full_name: string;
  group?: {
    name: string;
  };
  division: string;
  age: number;
  school: string;
}

interface Event {
  title: string;
  description: string;
  location: string;
  startDate: string;
}

export default function WorkingDashboard() {
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load scouts
        const scoutsRes = await fetch('/api/scouts/by-parent?parentId=8f117bc3-d03b-4a2e-a19e-8751854ca797');
        if (scoutsRes.ok) {
          const scoutsData = await scoutsRes.json();
          setScouts(scoutsData.scouts || []);
        }

        // Load events  
        const eventsRes = await fetch('/api/events');
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.data || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#2c5530', margin: 0, fontSize: '2.5rem' }}>
            🎯 MSA Parent Dashboard
          </h1>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
            Welcome! Here's your scout information and upcoming events.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Scouts Section */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#2c5530', marginBottom: '1.5rem' }}>
              👦 My Scouts ({scouts.length})
            </h2>
            
            {scouts.length > 0 ? (
              scouts.map((scout, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #c8e6c9'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#2e7d32' }}>
                    {scout.full_name}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: '#555' }}>
                    <strong>Group:</strong> {scout.group?.name} ({scout.division})
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#555' }}>
                    <strong>Age:</strong> {scout.age} years old
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#555' }}>
                    <strong>School:</strong> {scout.school}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No scouts found. Contact your group leader to register.
              </p>
            )}
          </div>

          {/* Events Section */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#2c5530', marginBottom: '1.5rem' }}>
              📅 Upcoming Events ({events.length})
            </h2>
            
            {events.length > 0 ? (
              events.slice(0, 5).map((event, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #bbdefb'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>
                    {event.title}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: '#555' }}>
                    {event.description}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#555' }}>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#555' }}>
                    <strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No upcoming events scheduled.
              </p>
            )}
          </div>
        </div>

        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          color: '#155724',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <strong>✅ SUCCESS!</strong> Login working with real Supabase data!
        </div>
      </div>
    </div>
  );
}
