"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";

interface DashboardStats {
  totalGroups: number;
  totalLeaders: number;
  totalMembers: number;
  upcomingEvents: number;
}

interface GroupData {
  id: string;
  name: string;
  memberCount: number;
  location: string;
}

interface MembershipData {
  month: string;
  count: number;
}

interface ReportData {
  id: string;
  title: string;
  date: string;
  type: string;
}

export default function ExecutiveDashboard() {
  // State for real data
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalLeaders: 0,
    totalMembers: 0,
    upcomingEvents: 0
  });
  
  const [groupData, setGroupData] = useState<GroupData[]>([]);
  const [membershipData, setMembershipData] = useState<MembershipData[]>([]);
  const [recentReports, setRecentReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all dashboard data
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [statsRes, groupsRes, membershipRes, reportsRes] = await Promise.all([
          fetch('/api/executive/dashboard-stats'),
          fetch('/api/executive/groups-overview'),
          fetch('/api/executive/membership-growth'),
          fetch('/api/executive/recent-reports')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          setGroupData(groupsData);
        }

        if (membershipRes.ok) {
          const membershipData = await membershipRes.json();
          setMembershipData(membershipData);
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setRecentReports(reportsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Executive Dashboard" 
      userRole="executive"
    >
      <div className="space-y-6">
        {/* MSA Islamic Welcome Section */}
        <div className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 rounded-xl p-6 border border-msa-light-sage/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🌙</div>
            <div>
              <h2 className="text-2xl font-bold text-msa-charcoal mb-1 font-primary">
                Assalamu Alaikum, Executive!
              </h2>
            </div>
          </div>
          <p className="text-msa-charcoal/80 text-lg font-secondary">
            Leading Mi'raj Scouts Academy - Organization-wide metrics and management
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-msa-sage">
              May Allah bless your guidance
            </span>
          </div>
        </div>

        {/* Data Management Quick Access */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-msa-charcoal mb-2">Data Management Center</h3>
              <p className="text-msa-charcoal/70 text-sm mb-3">
                Manage family applications and staff data with Excel templates
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="/admin/data-management"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Excel Data Management
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800">Family Applications</div>
              <div className="text-xs text-blue-600 mt-1">Upload 79+ family profiles with multiple children support</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-800">Staff Management</div>
              <div className="text-xs text-green-600 mt-1">Manage 39+ staff with qualifications and roles</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-sm font-medium text-purple-800">Group Assignments</div>
              <div className="text-xs text-purple-600 mt-1">Detailed A/B/C group assignments by age</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-9 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.totalGroups}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Leaders</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-9 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.totalLeaders}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-9 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.totalMembers}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-9 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Groups Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Groups Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : groupData.length > 0 ? (
                <div className="space-y-4">
                  {groupData.map((group) => (
                    <div key={group.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-gray-500">{group.location}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-msa-sage/20 text-msa-sage rounded-full text-xs">
                          {group.memberCount} members
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No groups found. Please add groups to the system.</p>
              )}
            </CardContent>
          </Card>

          {/* Membership Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Membership Growth</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 bg-gray-200 animate-pulse rounded"></div>
              ) : membershipData.length > 0 ? (
                <div className="h-48 flex items-end space-x-2">
                  {membershipData.map((item) => {
                    // Calculate height percentage based on max value
                    const maxCount = Math.max(...membershipData.map(d => d.count));
                    const heightPercent = maxCount > 0 ? (item.count / maxCount) * 80 : 0;
                    
                    return (
                      <div key={item.month} className="flex flex-col items-center flex-1">
                        <div className="relative w-full h-full flex items-end">
                          <div 
                            className="w-full bg-msa-forest rounded-t transition-all duration-500" 
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div className="absolute -top-5 left-0 right-0 text-center text-xs font-semibold">
                              {item.count}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs mt-1">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No membership data available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            ) : recentReports.length > 0 ? (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-gray-500">{report.date}</p>
                    </div>
                    <span className="inline-block px-2 py-1 bg-msa-light-sage/30 text-msa-charcoal rounded-full text-xs">
                      {report.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No reports available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
