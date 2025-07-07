"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Scout, Attendance, Event } from "@/types";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  Search, 
  Save, 
  Users, 
  MapPin,
  MessageSquare,
  Filter,
  Download,
  RotateCcw,
  User
} from "lucide-react";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

interface AttendanceRecord {
  scoutId: string;
  status: "present" | "absent" | "excused";
  notes?: string;
  arrivedLate?: boolean;
  leftEarly?: boolean;
}

interface AttendanceManagerProps {
  scouts: Scout[];
  groupId: string;
  groupName: string;
  onSaveAttendance: (attendanceRecords: AttendanceRecord[], date: string, eventId?: string) => void;
  existingAttendance?: Attendance[];
  events?: Event[];
}

export default function AttendanceManager({
  scouts,
  groupId,
  groupName,
  onSaveAttendance,
  existingAttendance = [],
  events = []
}: AttendanceManagerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent" | "excused">("all");
  const [bulkAction, setBulkAction] = useState<"present" | "absent" | "excused" | null>(null);

  // Initialize attendance records for all scouts
  useEffect(() => {
    const initRecords = scouts.map(scout => {
      const existing = existingAttendance.find(
        att => att.scoutId === scout.id && 
        att.date === selectedDate && 
        (!selectedEvent || att.eventId === selectedEvent)
      );
      
      return {
        scoutId: scout.id,
        status: existing ? (existing.present ? "present" : "absent") as "present" | "absent" | "excused" : "present",
        notes: existing?.notes || "",
        arrivedLate: false,
        leftEarly: false
      };
    });
    
    setAttendanceRecords(initRecords);
  }, [scouts, selectedDate, selectedEvent, existingAttendance]);

  // Filter scouts based on search and status
  const filteredScouts = scouts.filter(scout => {
    const matchesSearch = scout.name.toLowerCase().includes(searchTerm.toLowerCase());
    const record = attendanceRecords.find(r => r.scoutId === scout.id);
    const matchesFilter = filterStatus === "all" || record?.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Update attendance record for a scout
  const updateAttendance = (scoutId: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.scoutId === scoutId 
          ? { ...record, ...updates }
          : record
      )
    );
  };

  // Apply bulk action to all visible scouts
  const applyBulkAction = () => {
    if (!bulkAction) return;
    
    const visibleScoutIds = filteredScouts.map(s => s.id);
    setAttendanceRecords(prev => 
      prev.map(record => 
        visibleScoutIds.includes(record.scoutId)
          ? { ...record, status: bulkAction }
          : record
      )
    );
    setBulkAction(null);
  };

  // Calculate attendance statistics
  const stats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === "present").length,
    absent: attendanceRecords.filter(r => r.status === "absent").length,
    excused: attendanceRecords.filter(r => r.status === "excused").length
  };

  // Get events for selected date
  const dateEvents = events.filter(event => {
    const eventDate = new Date(event.startDate).toISOString().split('T')[0];
    return eventDate === selectedDate && (event.groupId === groupId || event.type === "organization-wide");
  });

  return (
    <div className="space-y-6">
      {/* Header with Islamic greeting */}
      <Card className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 border-msa-sage/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-msa-charcoal flex items-center gap-2">
                <Users className="w-6 h-6" />
                Attendance Management
              </CardTitle>
              <p className="text-msa-sage mt-1 flex items-center gap-2">
                <span>📋</span>
                Taking attendance with Islamic values of commitment and responsibility
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-msa-golden">
                {groupName}
              </div>
              <div className="text-sm text-gray-600">
                <DateTimeDisplay date={selectedDate} format="full" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Date and Event Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-msa-charcoal">
                <Calendar className="w-4 h-4" />
                Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-msa-charcoal">
                <MapPin className="w-4 h-4" />
                Associated Event (Optional)
              </label>
              <select
                value={selectedEvent || ""}
                onChange={(e) => setSelectedEvent(e.target.value || null)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Regular Meeting</option>
                {dateEvents.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-msa-sage">{stats.present}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Present
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4 text-red-500" />
              Absent
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-msa-golden">{stats.excused}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              Excused
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((stats.present / stats.total) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Attendance Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Bulk Actions */}
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="excused">Excused</option>
          </select>

          <div className="flex gap-1">
            <Button
              variant={bulkAction === "present" ? "default" : "outline"}
              size="sm"
              onClick={() => setBulkAction(bulkAction === "present" ? null : "present")}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              Mark All Present
            </Button>
            <Button
              variant={bulkAction === "absent" ? "default" : "outline"}
              size="sm"
              onClick={() => setBulkAction(bulkAction === "absent" ? null : "absent")}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Mark All Absent
            </Button>
          </div>

          {bulkAction && (
            <Button
              onClick={applyBulkAction}
              className="bg-msa-sage hover:bg-msa-sage/90"
            >
              Apply
            </Button>
          )}
        </div>
      </div>

      {/* Scout Attendance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScouts.map((scout) => {
          const record = attendanceRecords.find(r => r.scoutId === scout.id);
          if (!record) return null;

          return (
            <Card key={scout.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Scout Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-msa-sage/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-msa-sage" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-msa-charcoal">{scout.name}</div>
                      <div className="text-sm text-gray-500">
                        Age {scout.age} • {scout.rank}
                      </div>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={record.status === "present" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAttendance(scout.id, { status: "present" })}
                      className={record.status === "present" 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "text-green-600 border-green-600 hover:bg-green-50"
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      variant={record.status === "absent" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAttendance(scout.id, { status: "absent" })}
                      className={record.status === "absent" 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "text-red-600 border-red-600 hover:bg-red-50"
                      }
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Absent
                    </Button>
                    <Button
                      variant={record.status === "excused" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAttendance(scout.id, { status: "excused" })}
                      className={record.status === "excused" 
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                        : "text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      }
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Excused
                    </Button>
                  </div>

                  {/* Additional Options */}
                  {record.status === "present" && (
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={record.arrivedLate || false}
                          onChange={(e) => updateAttendance(scout.id, { arrivedLate: e.target.checked })}
                        />
                        Late
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={record.leftEarly || false}
                          onChange={(e) => updateAttendance(scout.id, { leftEarly: e.target.checked })}
                        />
                        Left Early
                      </label>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotes(showNotes === scout.id ? null : scout.id)}
                      className="w-full text-xs"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {record.notes ? "Edit Notes" : "Add Notes"}
                    </Button>
                    
                    {showNotes === scout.id && (
                      <textarea
                        value={record.notes}
                        onChange={(e) => updateAttendance(scout.id, { notes: e.target.value })}
                        placeholder="Add notes about attendance..."
                        className="w-full p-2 text-xs border rounded-md resize-none"
                        rows={2}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredScouts.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No scouts found
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "No scouts available for attendance"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <Button
          onClick={() => onSaveAttendance(attendanceRecords, selectedDate, selectedEvent || undefined)}
          className="bg-msa-sage hover:bg-msa-sage/90 text-white flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Attendance
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            const initRecords = scouts.map(scout => ({
              scoutId: scout.id,
              status: "present" as const,
              notes: "",
              arrivedLate: false,
              leftEarly: false
            }));
            setAttendanceRecords(initRecords);
          }}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Islamic Values Note */}
      <Card className="bg-msa-golden/5 border-msa-golden/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-msa-golden">
            <span className="text-lg">🤲</span>
            <span className="text-sm font-medium">
              "And whoever is regular in their prayers, they maintain their trust and keep their promises." - Quran
            </span>
          </div>
          <p className="text-xs text-msa-sage mt-2">
            Regular attendance reflects commitment to Allah and community. May Allah bless our consistent efforts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}