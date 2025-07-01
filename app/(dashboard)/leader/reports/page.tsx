"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { leaderNavigation } from "@/components/navigation/LeaderNavigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { mockReports } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";

export default function LeaderReportsPage() {
  const [activeTab, setActiveTab] = useState("incidents");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Helper to filter reports by type and search term
  const filterReports = (type: string) => {
    return mockReports
      .filter(report => 
        report.type === type && 
        (report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         report.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  // Get filtered reports by type
  const incidentReports = filterReports("incident");
  const activityReports = filterReports("activity");
  const progressReports = filterReports("progress");
  
  return (
    <DashboardLayout 
      navigation={leaderNavigation} 
      pageTitle="Reports"
      userRole="leader"
    >
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Report Management</h1>
          <Button>Create New Report</Button>
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="incidents">Incident Reports</TabsTrigger>
            <TabsTrigger value="activities">Activity Reports</TabsTrigger>
            <TabsTrigger value="progress">Progress Reports</TabsTrigger>
          </TabsList>
          
          {/* Incident Reports Tab */}
          <TabsContent value="incidents" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Incident Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {incidentReports.length > 0 ? (
                  <div className="space-y-4">
                    {incidentReports.map((report) => (
                      <Card key={report.id} className="overflow-hidden">
                        <div className="p-4 border-l-4 border-red-500">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-semibold">{report.title}</h3>
                            <span className="text-sm text-gray-500">{formatDate(report.date, "MMM dd, yyyy")}</span>
                          </div>
                          <p className="text-gray-600 mt-2">{report.description}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                                {report.status}
                              </span>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No incident reports found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Activity Reports Tab */}
          <TabsContent value="activities" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {activityReports.length > 0 ? (
                  <div className="space-y-4">
                    {activityReports.map((report) => (
                      <Card key={report.id} className="overflow-hidden">
                        <div className="p-4 border-l-4 border-green-500">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-semibold">{report.title}</h3>
                            <span className="text-sm text-gray-500">{formatDate(report.date, "MMM dd, yyyy")}</span>
                          </div>
                          <p className="text-gray-600 mt-2">{report.description}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                {report.status}
                              </span>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No activity reports found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Progress Reports Tab */}
          <TabsContent value="progress" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {progressReports.length > 0 ? (
                  <div className="space-y-4">
                    {progressReports.map((report) => (
                      <Card key={report.id} className="overflow-hidden">
                        <div className="p-4 border-l-4 border-blue-500">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-semibold">{report.title}</h3>
                            <span className="text-sm text-gray-500">{formatDate(report.date, "MMM dd, yyyy")}</span>
                          </div>
                          <p className="text-gray-600 mt-2">{report.description}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {report.status}
                              </span>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No progress reports found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Report Templates */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">Incident Report</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Report accidents, injuries, or behavior issues
                </p>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">Weekly Activity Summary</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Document weekly troop activities and accomplishments
                </p>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">Scout Progress Report</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Document advancement and achievement progress for scouts
                </p>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">Event Feedback</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Provide feedback on recently completed events
                </p>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">Equipment Inventory</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Document available and needed equipment
                </p>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">Custom Report</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create a custom report for specific needs
                </p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
