'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Scout {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  group?: {
    name: string;
  };
  division: string;
  age: number;
  school: string;
  email: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  date: string;
  time: string;
  section: string;
}

export default function LeaderDashboardPage() {
  const { userDetails, loading: authLoading, signOut } = useAuth();
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !userDetails) {
      router.push('/login');
      return;
    }
    
    if (userDetails) {
      loadDashboardData();
    }
  }, [userDetails, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all scouts for leaders
      const scoutsRes = await fetch('/api/scouts');
      if (scoutsRes.ok) {
        const scoutsData = await scoutsRes.json();
        setScouts(scoutsData.data || []);
      } else {
        console.warn('Could not load scouts data');
      }

      // Load upcoming events
      const eventsRes = await fetch('/api/events');
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.data || []);
      } else {
        console.warn('Could not load events data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MSA Leader Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {userDetails.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">👦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Scouts</dt>
                    <dd className="text-lg font-medium text-gray-900">{scouts.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">📅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                    <dd className="text-lg font-medium text-gray-900">{events.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Reports</dt>
                    <dd className="text-lg font-medium text-gray-900">View</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scouts Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                All Scouts ({scouts.length})
              </h3>
              
              {scouts.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {scouts.slice(0, 10).map((scout) => (
                    <div key={scout.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {scout.full_name || `${scout.first_name} ${scout.last_name}`}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p><strong>Division:</strong> {scout.division}</p>
                        <p><strong>Age:</strong> {scout.age} years</p>
                        <p><strong>School:</strong> {scout.school}</p>
                        <p><strong>Email:</strong> {scout.email}</p>
                      </div>
                      {scout.group && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Group:</strong> {scout.group.name}
                        </p>
                      )}
                    </div>
                  ))}
                  {scouts.length > 10 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">And {scouts.length - 10} more scouts...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No scouts found.</p>
                  <p className="text-sm text-gray-400">Scouts data will appear here when available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Upcoming Events ({events.length})
              </h3>
              
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                        <p><strong>Location:</strong> {event.location}</p>
                        <p><strong>Date:</strong> {new Date(event.date || event.startDate).toLocaleDateString()}</p>
                        {event.time && <p><strong>Time:</strong> {event.time}</p>}
                        {event.section && <p><strong>Section:</strong> {event.section}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No upcoming events scheduled.</p>
                  <p className="text-sm text-gray-400">Create events to see them here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Leader Tools</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <button
                onClick={() => router.push('/leader/scouts')}
                className="p-4 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-center"
              >
                <div className="text-2xl mb-2">👦</div>
                <div className="font-medium">Manage Scouts</div>
              </button>
              <button
                onClick={() => router.push('/leader/events')}
                className="p-4 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-center"
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium">Events</div>
              </button>
              <button
                onClick={() => router.push('/leader/attendance')}
                className="p-4 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-center"
              >
                <div className="text-2xl mb-2">✅</div>
                <div className="font-medium">Attendance</div>
              </button>
              <button
                onClick={() => router.push('/leader/reports')}
                className="p-4 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-center"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">Reports</div>
              </button>
              <button
                onClick={() => router.push('/leader/messages')}
                className="p-4 bg-pink-100 text-pink-800 rounded-lg hover:bg-pink-200 transition-colors text-center"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="font-medium">Messages</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}