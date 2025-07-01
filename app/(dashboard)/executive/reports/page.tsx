"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

export default function ExecutiveReportsPage() {
  const [reportType, setReportType] = useState("all");

  // Mock reports data
  const reports = [
    {
      id: "r1",
      title: "Quarterly Attendance Summary",
      description: "Summary of attendance across all scout groups",
      date: new Date(2025, 5, 30), // June 30, 2025
      type: "attendance",
      generatedBy: "System",
      status: "completed"
    },
    {
      id: "r2",
      title: "Annual Achievement Progress",
      description: "Progress report on scout achievements for the year",
      date: new Date(2025, 4, 15), // May 15, 2025
      type: "achievement",
      generatedBy: "Sarah Williams",
      status: "completed"
    },
    {
      id: "r3",
      title: "Financial Statement Q2",
      description: "Financial report for the second quarter",
      date: new Date(2025, 6, 5), // July 5, 2025
      type: "financial",
      generatedBy: "System",
      status: "pending"
    },
    {
      id: "r4",
      title: "Group Growth Analysis",
      description: "Analysis of membership growth by group",
      date: new Date(2025, 3, 22), // April 22, 2025
      type: "membership",
      generatedBy: "Sarah Williams",
      status: "completed"
    },
    {
      id: "r5",
      title: "Event Participation Summary",
      description: "Summary of participation in events for the past 6 months",
      date: new Date(2025, 2, 10), // March 10, 2025
      type: "event",
      generatedBy: "System",
      status: "completed"
    }
  ];

  // Filter reports based on selected type
  const filteredReports = reportType === "all" 
    ? reports 
    : reports.filter(report => report.type === reportType);

  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Reports" 
      userRole="executive"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Organization Reports</h2>
            <p className="text-gray-500">Generate and view reports for the entire organization</p>
          </div>
          <Button className="flex items-center space-x-2">
            <span>Generate New Report</span>
          </Button>
        </div>

        {/* Report Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/3">
            <Input placeholder="Search reports..." />
          </div>
          <div className="w-full md:w-1/3">
            <Select
              value={reportType}
              onValueChange={(value: string) => setReportType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="attendance">Attendance Reports</SelectItem>
                <SelectItem value="achievement">Achievement Reports</SelectItem>
                <SelectItem value="financial">Financial Reports</SelectItem>
                <SelectItem value="membership">Membership Reports</SelectItem>
                <SelectItem value="event">Event Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map(report => (
            <Card key={report.id}>
              <CardContent className="p-5 flex flex-col md:flex-row justify-between">
                <div className="flex-grow">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    <span className={`ml-3 text-xs font-medium px-2 py-1 rounded ${
                      report.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {report.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-24">Date:</span>
                      <span className="text-sm">
                        <DateTimeDisplay date={report.date} format="full" />
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-24">Type:</span>
                      <span className="text-sm capitalize">{report.type}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-24">Generated By:</span>
                      <span className="text-sm">{report.generatedBy}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0 justify-end">
                  <Button className="text-sm">View</Button>
                  <Button 
                    className="text-sm bg-gray-500 hover:bg-gray-600"
                  >
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
