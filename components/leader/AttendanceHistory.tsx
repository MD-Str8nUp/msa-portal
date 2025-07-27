"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Scout, Attendance } from "@/types";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Download, 
  Filter,
  Search,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Eye,
  Mail,
  Phone
} from "lucide-react";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

interface AttendanceHistoryProps {
  scouts: Scout[];
  attendance: Attendance[];
  groupName: string;
  onContactParent?: (scoutId: string) => void;
  onExportReport?: (scoutId?: string, dateRange?: { start: string; end: string }) => void;
}

interface ScoutAttendanceStats {
  scoutId: string;
  scout: Scout;
  totalSessions: number;
  present: number;
  absent: number;
  excused: number;
  attendanceRate: number;
  streak: number;
  recentTrend: "improving" | "declining" | "stable";
  lastAttended: string;
  consecutiveAbsences: number;
}

export default function AttendanceHistory({
  scouts,
  attendance,
  groupName,
  onContactParent,
  onExportReport
}: AttendanceHistoryProps) {
  const [selectedScout, setSelectedScout] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "attendance" | "trend">("attendance");
  const [filterBy, setFilterBy] = useState<"all" | "good" | "concerning" | "poor">("all");

  // Calculate attendance statistics for each scout
  const scoutStats: ScoutAttendanceStats[] = useMemo(() => {
    return scouts.map(scout => {
      const scoutAttendance = attendance.filter(att => 
        att.scoutId === scout.id &&
        att.date >= dateRange.start &&
        att.date <= dateRange.end
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const totalSessions = scoutAttendance.length;
      const present = scoutAttendance.filter(att => att.present).length;
      const absent = scoutAttendance.filter(att => !att.present && !att.notes?.toLowerCase().includes('excused')).length;
      const excused = scoutAttendance.filter(att => !att.present && att.notes?.toLowerCase().includes('excused')).length;
      const attendanceRate = totalSessions > 0 ? (present / totalSessions) * 100 : 0;

      // Calculate streak (consecutive present sessions from end)
      let streak = 0;
      for (let i = scoutAttendance.length - 1; i >= 0; i--) {
        if (scoutAttendance[i].present) {
          streak++;
        } else {
          break;
        }
      }

      // Calculate consecutive absences from end
      let consecutiveAbsences = 0;
      for (let i = scoutAttendance.length - 1; i >= 0; i--) {
        if (!scoutAttendance[i].present) {
          consecutiveAbsences++;
        } else {
          break;
        }
      }

      // Determine trend (comparing first and second half of period)
      const midPoint = Math.floor(scoutAttendance.length / 2);
      const firstHalf = scoutAttendance.slice(0, midPoint);
      const secondHalf = scoutAttendance.slice(midPoint);
      
      const firstHalfRate = firstHalf.length > 0 ? (firstHalf.filter(att => att.present).length / firstHalf.length) * 100 : 0;
      const secondHalfRate = secondHalf.length > 0 ? (secondHalf.filter(att => att.present).length / secondHalf.length) * 100 : 0;
      
      let recentTrend: "improving" | "declining" | "stable" = "stable";
      if (secondHalfRate > firstHalfRate + 10) recentTrend = "improving";
      else if (secondHalfRate < firstHalfRate - 10) recentTrend = "declining";

      const lastAttended = scoutAttendance.filter(att => att.present).slice(-1)[0]?.date || "";

      return {
        scoutId: scout.id,
        scout,
        totalSessions,
        present,
        absent,
        excused,
        attendanceRate,
        streak,
        recentTrend,
        lastAttended,
        consecutiveAbsences
      };
    });
  }, [scouts, attendance, dateRange]);

  // Filter and sort scouts
  const filteredStats = useMemo(() => {
    let filtered = scoutStats.filter(stat => {
      const matchesSearch = stat.scout.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      switch (filterBy) {
        case "good":
          matchesFilter = stat.attendanceRate >= 85;
          break;
        case "concerning":
          matchesFilter = stat.attendanceRate >= 70 && stat.attendanceRate < 85;
          break;
        case "poor":
          matchesFilter = stat.attendanceRate < 70;
          break;
      }
      
      return matchesSearch && matchesFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.scout.name.localeCompare(b.scout.name);
        case "attendance":
          return b.attendanceRate - a.attendanceRate;
        case "trend":
          const trendOrder = { improving: 3, stable: 2, declining: 1 };
          return trendOrder[b.recentTrend] - trendOrder[a.recentTrend];
        default:
          return 0;
      }
    });

    return filtered;
  }, [scoutStats, searchTerm, filterBy, sortBy]);

  // Calculate group statistics
  const groupStats = useMemo(() => {
    const total = scoutStats.length;
    const avgAttendance = total > 0 ? scoutStats.reduce((sum, stat) => sum + stat.attendanceRate, 0) / total : 0;
    const goodAttendance = scoutStats.filter(stat => stat.attendanceRate >= 85).length;
    const needsAttention = scoutStats.filter(stat => stat.consecutiveAbsences >= 3).length;
    
    return {
      total,
      avgAttendance,
      goodAttendance,
      needsAttention
    };
  }, [scoutStats]);

  const getTrendIcon = (trend: "improving" | "declining" | "stable") => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 85) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 border-msa-sage/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-msa-charcoal flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Attendance History & Reports
              </CardTitle>
              <p className="text-msa-sage mt-1">{groupName} • Tracking commitment and growth</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-msa-golden">
                {Math.round(groupStats.avgAttendance)}%
              </div>
              <div className="text-sm text-gray-600">Group Average</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Date Range Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <span className="self-center text-gray-500">to</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            <Button
              onClick={() => onExportReport?.(undefined, dateRange)}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Group Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Group Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-msa-sage">{groupStats.total}</div>
            <div className="text-sm text-gray-500">Total Scouts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{groupStats.goodAttendance}</div>
            <div className="text-sm text-gray-500">Good Attendance (85%+)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-msa-golden">
              {Math.round(groupStats.avgAttendance)}%
            </div>
            <div className="text-sm text-gray-500">Average Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{groupStats.needsAttention}</div>
            <div className="text-sm text-gray-500">Need Attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search scouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Scouts</option>
            <option value="good">Good (85%+)</option>
            <option value="concerning">Concerning (70-85%)</option>
            <option value="poor">Poor (&lt;70%)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="attendance">Sort by Attendance</option>
            <option value="name">Sort by Name</option>
            <option value="trend">Sort by Trend</option>
          </select>
        </div>
      </div>

      {/* Scouts List */}
      <div className="space-y-4">
        {filteredStats.map((stat) => (
          <Card key={stat.scoutId} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Scout Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-msa-sage/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-msa-sage" />
                  </div>
                  <div>
                    <div className="font-semibold text-msa-charcoal">{stat.scout.name}</div>
                    <div className="text-sm text-gray-500">
                      Age {stat.scout.age} • {stat.scout.rank}
                    </div>
                  </div>
                </div>

                {/* Attendance Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getAttendanceColor(stat.attendanceRate)}`}>
                      {Math.round(stat.attendanceRate)}%
                    </div>
                    <div className="text-xs text-gray-500">Attendance</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(stat.recentTrend)}
                      <span className="text-sm capitalize">{stat.recentTrend}</span>
                    </div>
                    <div className="text-xs text-gray-500">Trend</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold">{stat.streak}</div>
                    <div className="text-xs text-gray-500">Streak</div>
                  </div>

                  {/* Warning for consecutive absences */}
                  {stat.consecutiveAbsences >= 3 && (
                    <div className="text-center">
                      <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
                      <div className="text-xs text-red-500">
                        {stat.consecutiveAbsences} absences
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScout(selectedScout === stat.scoutId ? null : stat.scoutId)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                  
                  {onContactParent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onContactParent(stat.scoutId)}
                      className="text-msa-sage border-msa-sage hover:bg-msa-sage/10"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExportReport?.(stat.scoutId, dateRange)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Detailed Stats */}
              {selectedScout === stat.scoutId && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{stat.present}</div>
                      <div className="text-xs text-gray-500">Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">{stat.absent}</div>
                      <div className="text-xs text-gray-500">Absent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-600">{stat.excused}</div>
                      <div className="text-xs text-gray-500">Excused</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{stat.totalSessions}</div>
                      <div className="text-xs text-gray-500">Total Sessions</div>
                    </div>
                  </div>

                  {stat.lastAttended && (
                    <div className="text-sm text-gray-600">
                      Last attended: <DateTimeDisplay date={stat.lastAttended} format="short" />
                    </div>
                  )}

                  {/* Recent attendance pattern */}
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Recent Attendance Pattern:</div>
                    <div className="flex gap-1">
                      {attendance
                        .filter(att => att.scoutId === stat.scoutId && att.date >= dateRange.start && att.date <= dateRange.end)
                        .slice(-10)
                        .map((att, index) => (
                          <div
                            key={index}
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs text-white ${
                              att.present ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            title={`${att.date}: ${att.present ? 'Present' : 'Absent'}`}
                          >
                            {att.present ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredStats.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No attendance records found
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "No attendance data available for the selected period"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Islamic Values Note */}
      <Card className="bg-msa-golden/5 border-msa-golden/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-msa-golden">
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium">
              "And give good tidings to those who are patient and consistent." - Quran 2:155
            </span>
          </div>
          <p className="text-xs text-msa-sage mt-2">
            Regular attendance builds character and strengthens our community bonds. May Allah reward our consistency.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}