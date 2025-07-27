'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Scout {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  group_name: string;
}

interface Group {
  id: string;
  name: string;
  division: string;
  scouts: Scout[];
}

interface AttendanceRecord {
  scout_id: string;
  scout_name: string;
  group_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export default function LeaderAttendancePage() {
  const { userDetails, loading: authLoading, signOut } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !userDetails) {
      router.push('/login');
      return;
    }
    
    if (userDetails) {
      loadGroupsData();
    }
  }, [userDetails, authLoading, router]);

  useEffect(() => {
    if (selectedGroup && selectedDate) {
      loadAttendanceData();
    }
  }, [selectedGroup, selectedDate]);

  const loadGroupsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load leader's groups with scouts
      const groupsRes = await fetch(`/api/groups?leaderId=${userDetails?.id}&limit=100`);
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        const leaderGroups = groupsData.data?.groups || [];
        setGroups(leaderGroups);
        
        // Auto-select first group if available
        if (leaderGroups.length > 0 && !selectedGroup) {
          setSelectedGroup(leaderGroups[0].id);
        }
      } else {
        console.warn('Could not load groups data');
      }
    } catch (error) {
      console.error('Error loading groups data:', error);
      setError('Failed to load groups data');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const selectedGroupData = groups.find(g => g.id === selectedGroup);
      if (!selectedGroupData) return;

      // Load existing attendance records for this date
      const attendanceRes = await fetch(`/api/attendance?date=${selectedDate}&groupId=${selectedGroup}`);
      const records: { [key: string]: string } = {};
      
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        const existingRecords = attendanceData.data || [];
        
        // Map existing records
        existingRecords.forEach((record: any) => {
          records[record.scout_id] = record.status.toLowerCase();
        });
      }

      // Initialize all scouts (default to present if no record exists)
      selectedGroupData.scouts.forEach(scout => {
        if (!records[scout.id]) {
          records[scout.id] = 'present';
        }
      });
      
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  const handleAttendanceChange = (scoutId: string, status: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [scoutId]: status
    }));
    setSaveStatus('idle');
  };

  const saveAttendance = async () => {
    try {
      setSaveStatus('saving');
      
      const selectedGroupData = groups.find(g => g.id === selectedGroup);
      if (!selectedGroupData) {
        throw new Error('No group selected');
      }

      // Save attendance records for each scout
      const savePromises = Object.entries(attendanceRecords).map(async ([scoutId, status]) => {
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scout_id: scoutId,
            date: selectedDate,
            status: status.toUpperCase(),
            group_id: selectedGroup,
            leader_id: userDetails?.id,
            notes: `Recorded by ${userDetails?.name}`
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save attendance');
        }

        return response.json();
      });

      await Promise.all(savePromises);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✅';
      case 'absent': return '❌';
      case 'late': return '⏰';
      case 'excused': return '📝';
      default: return '❓';
    }
  };

  const selectedGroupData = groups.find(g => g.id === selectedGroup);
  const scouts = selectedGroupData?.scouts || [];

  const attendanceStats = {
    present: Object.values(attendanceRecords).filter(status => status === 'present').length,
    absent: Object.values(attendanceRecords).filter(status => status === 'absent').length,
    late: Object.values(attendanceRecords).filter(status => status === 'late').length,
    excused: Object.values(attendanceRecords).filter(status => status === 'excused').length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
              <p className="text-sm text-gray-600">Track attendance for your scouts</p>
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

        {/* Selection Controls */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Group and Date</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">
                  Group
                </label>
                <select
                  id="group-select"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="date-select" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={saveAttendance}
                  disabled={saveStatus === 'saving' || !selectedGroup}
                  className={`w-full px-4 py-2 rounded-md transition-colors ${
                    saveStatus === 'saving' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : saveStatus === 'saved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : saveStatus === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white`}
                >
                  {saveStatus === 'saving' && 'Saving...'}
                  {saveStatus === 'saved' && '✅ Saved'}
                  {saveStatus === 'error' && '❌ Error'}
                  {saveStatus === 'idle' && 'Save Attendance'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedGroup && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">✅</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Present</dt>
                        <dd className="text-lg font-medium text-gray-900">{attendanceStats.present}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold">❌</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Absent</dt>
                        <dd className="text-lg font-medium text-gray-900">{attendanceStats.absent}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-bold">⏰</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Late</dt>
                        <dd className="text-lg font-medium text-gray-900">{attendanceStats.late}</dd>
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
                        <span className="text-blue-600 font-bold">📝</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Excused</dt>
                        <dd className="text-lg font-medium text-gray-900">{attendanceStats.excused}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {selectedGroupData?.name} - {new Date(selectedDate).toLocaleDateString()}
                </h3>
                
                {scouts.length > 0 ? (
                  <div className="space-y-4">
                    {scouts.map((scout) => (
                      <div key={scout.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              getStatusColor(attendanceRecords[scout.id] || 'present')
                            }`}>
                              <span className="text-sm">
                                {getStatusIcon(attendanceRecords[scout.id] || 'present')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {scout.first_name} {scout.last_name}
                              </h4>
                              <p className="text-sm text-gray-500">Age {scout.age}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {['present', 'absent', 'late', 'excused'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleAttendanceChange(scout.id, status)}
                                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                  attendanceRecords[scout.id] === status
                                    ? getStatusColor(status)
                                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                }`}
                              >
                                {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No scouts found in this group.</p>
                    <p className="text-sm text-gray-400">Scouts will appear here when they are assigned to the group.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {!selectedGroup && groups.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Group</h3>
              <p className="text-gray-500">Choose a group from the dropdown above to start taking attendance.</p>
            </div>
          </div>
        )}

        {groups.length === 0 && !loading && (
          <div className="bg-white shadow rounded-lg">
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Found</h3>
              <p className="text-gray-500">You don't have any groups assigned to you yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}