'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Scout {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  school: string;
  address: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  group?: {
    name: string;
  };
}

interface Group {
  id: string;
  name: string;
  division: string;
  scouts: Scout[];
}

export default function LeaderScoutsPage() {
  const { userDetails, loading: authLoading, signOut } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingScout, setEditingScout] = useState<Scout | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !userDetails) {
      router.push('/login');
      return;
    }
    
    if (userDetails) {
      loadScoutsData();
    }
  }, [userDetails, authLoading, router]);

  const loadScoutsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load leader's groups with scouts
      const groupsRes = await fetch(`/api/groups?leaderId=${userDetails?.id}&limit=100`);
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        const leaderGroups = groupsData.data?.groups || [];
        
        setGroups(leaderGroups);
        
        // Extract all scouts from leader's groups
        const allScouts = leaderGroups.flatMap((group: Group) => 
          (group.scouts || []).map((scout: Scout) => ({
            ...scout,
            group: { name: group.name }
          }))
        );
        setScouts(allScouts);
      } else {
        console.warn('Could not load groups data');
      }
    } catch (error) {
      console.error('Error loading scouts data:', error);
      setError('Failed to load scouts data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditScout = (scout: Scout) => {
    setEditingScout(scout);
    setShowEditModal(true);
  };

  const handleSaveScout = async () => {
    if (!editingScout) return;
    
    try {
      setSaving(true);
      setError('');

      // In a real implementation, this would call the scouts API
      // For now, we'll update the local state
      setScouts(prev => prev.map(scout => 
        scout.id === editingScout.id ? editingScout : scout
      ));

      setShowEditModal(false);
      setEditingScout(null);
      
      // Real implementation would be:
      // const response = await fetch(`/api/scouts/${editingScout.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editingScout)
      // });
      
    } catch (error) {
      console.error('Error saving scout:', error);
      setError('Failed to save scout changes');
    } finally {
      setSaving(false);
    }
  };


  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Filter scouts based on selected group and search term
  const filteredScouts = scouts.filter(scout => {
    const matchesGroup = selectedGroup === 'all' || scout.group?.name === selectedGroup;
    const matchesSearch = searchTerm === '' || 
      scout.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scout.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scout.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scout.school.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesGroup && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scouts...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Scouts</h1>
              <p className="text-sm text-gray-600">Manage scouts in your groups</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/leader/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
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
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">🏕️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">My Groups</dt>
                    <dd className="text-lg font-medium text-gray-900">{groups.length}</dd>
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
                    <span className="text-blue-600 font-bold">🔍</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Filtered Results</dt>
                    <dd className="text-lg font-medium text-gray-900">{filteredScouts.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700">
                  Filter by Group
                </label>
                <select
                  id="group-filter"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Groups</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search Scouts
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or school..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scouts List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Scouts ({filteredScouts.length})
            </h3>
            
            {filteredScouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScouts.map((scout) => (
                  <div key={scout.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {scout.full_name || `${scout.first_name} ${scout.last_name}`}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Age {scout.age}
                        </span>
                        <button
                          onClick={() => handleEditScout(scout)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Edit Scout"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Group:</strong> {scout.group?.name}</p>
                      <p><strong>Gender:</strong> {scout.gender}</p>
                      <p><strong>Email:</strong> {scout.email}</p>
                      {scout.phone && <p><strong>Phone:</strong> {scout.phone}</p>}
                      <p><strong>School:</strong> {scout.school}</p>
                      {scout.parent_name && (
                        <div className="pt-2 border-t border-gray-200">
                          <p><strong>Parent:</strong> {scout.parent_name}</p>
                          {scout.parent_email && <p><strong>Parent Email:</strong> {scout.parent_email}</p>}
                          {scout.parent_phone && <p><strong>Parent Phone:</strong> {scout.parent_phone}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No scouts found matching your criteria.</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Scout Modal */}
        {showEditModal && editingScout && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Scout Details</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      value={editingScout.first_name}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, first_name: e.target.value} : null)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      value={editingScout.last_name}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, last_name: e.target.value} : null)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      min="5"
                      max="18"
                      value={editingScout.age}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, age: parseInt(e.target.value)} : null)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={editingScout.gender}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, gender: e.target.value} : null)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={editingScout.email}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, email: e.target.value} : null)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={editingScout.phone}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, phone: e.target.value} : null)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                      School
                    </label>
                    <input
                      type="text"
                      id="school"
                      value={editingScout.school}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, school: e.target.value} : null)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="parent-name" className="block text-sm font-medium text-gray-700">
                      Parent Name
                    </label>
                    <input
                      type="text"
                      id="parent-name"
                      value={editingScout.parent_name}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, parent_name: e.target.value} : null)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="parent-email" className="block text-sm font-medium text-gray-700">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      id="parent-email"
                      value={editingScout.parent_email}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, parent_email: e.target.value} : null)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="parent-phone" className="block text-sm font-medium text-gray-700">
                      Parent Phone
                    </label>
                    <input
                      type="tel"
                      id="parent-phone"
                      value={editingScout.parent_phone}
                      onChange={(e) => setEditingScout(prev => prev ? {...prev, parent_phone: e.target.value} : null)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveScout}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}