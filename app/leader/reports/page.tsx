'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AttendanceReport {
  scout_id: string;
  scout_name: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number;
}

interface Group {
  id: string;
  name: string;
  division: string;
  scouts: any[];
}

export default function LeaderReportsPage() {
  const { userDetails, loading: authLoading, signOut } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [attendanceReports, setAttendanceReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    if (groups.length > 0) {
      generateReport();
    }
  }, [selectedGroup, reportType, dateRange, groups]);

  const loadGroupsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load leader's groups
      const groupsRes = await fetch(`/api/groups?leaderId=${userDetails?.id}&limit=100`);
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        const leaderGroups = groupsData.data?.groups || [];
        setGroups(leaderGroups);
      }
    } catch (error) {
      console.error('Error loading groups data:', error);
      setError('Failed to load groups data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (reportType !== 'attendance') return;
    
    try {
      setLoading(true);
      
      // Get attendance data for the selected group(s) and date range
      const groupsToAnalyze = selectedGroup === 'all' ? groups : groups.filter(g => g.id === selectedGroup);
      
      const attendancePromises = groupsToAnalyze.map(async (group) => {
        const response = await fetch(
          `/api/attendance?groupId=${group.id}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        );
        
        if (response.ok) {
          const data = await response.json();
          return { group, attendance: data.data || [] };
        }
        return { group, attendance: [] };
      });

      const attendanceData = await Promise.all(attendancePromises);
      
      // Process attendance data into reports
      const reports: AttendanceReport[] = [];
      
      groupsToAnalyze.forEach((group) => {
        const groupAttendance = attendanceData.find(d => d.group.id === group.id)?.attendance || [];
        
        group.scouts.forEach((scout: any) => {
          const scoutAttendance = groupAttendance.filter((record: any) => record.scout_id === scout.id);
          
          const present = scoutAttendance.filter((r: any) => r.status?.toLowerCase() === 'present').length;
          const absent = scoutAttendance.filter((r: any) => r.status?.toLowerCase() === 'absent').length;
          const late = scoutAttendance.filter((r: any) => r.status?.toLowerCase() === 'late').length;
          const excused = scoutAttendance.filter((r: any) => r.status?.toLowerCase() === 'excused').length;
          
          const totalSessions = present + absent + late + excused;
          const attendanceRate = totalSessions > 0 ? (present + late + excused) / totalSessions * 100 : 0;

          reports.push({
            scout_id: scout.id,
            scout_name: `${scout.first_name} ${scout.last_name}`,
            total_sessions: totalSessions,
            present_count: present,
            absent_count: absent,
            late_count: late,
            excused_count: excused,
            attendance_rate: Math.round(attendanceRate)
          });
        });
      });

      // Sort by attendance rate (lowest first to identify at-risk scouts)
      reports.sort((a, b) => a.attendance_rate - b.attendance_rate);
      setAttendanceReports(reports);
      
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (attendanceReports.length === 0) return;

    const csvHeaders = [
      'Scout Name',
      'Total Sessions',
      'Present',
      'Absent',
      'Late',
      'Excused',
      'Attendance Rate (%)'
    ];

    const csvData = attendanceReports.map(report => [
      report.scout_name,
      report.total_sessions,
      report.present_count,
      report.absent_count,
      report.late_count,
      report.excused_count,
      report.attendance_rate
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${selectedGroup === 'all' ? 'all-groups' : 'group'}-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 75) return 'text-yellow-600 bg-yellow-100';
    if (rate >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating reports...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-sm text-gray-600">Generate and analyze reports for your groups</p>
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

        {/* Report Configuration */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">
                  Report Type
                </label>
                <select
                  id="report-type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                >
                  <option value="attendance">Attendance Report</option>
                  <option value="progress" disabled>Progress Report (Coming Soon)</option>
                  <option value="events" disabled>Events Report (Coming Soon)</option>
                </select>
              </div>
              <div>
                <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700">
                  Group
                </label>
                <select
                  id="group-filter"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Groups</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Report Results */}
        {reportType === 'attendance' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Attendance Report ({attendanceReports.length} scouts)
                </h3>
                <button
                  onClick={exportReport}
                  disabled={attendanceReports.length === 0}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Export CSV
                </button>
              </div>
              
              {attendanceReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scout Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Sessions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Late
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Excused
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceReports.map((report) => (
                        <tr key={report.scout_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.scout_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.total_sessions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {report.present_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {report.absent_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                            {report.late_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            {report.excused_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(report.attendance_rate)}`}>
                              {report.attendance_rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No attendance data found for the selected criteria.</p>
                  <p className="text-sm text-gray-400">Try adjusting your date range or group selection.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}