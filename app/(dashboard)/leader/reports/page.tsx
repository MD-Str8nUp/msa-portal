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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReport, setNewReport] = useState({
    type: 'incident',
    title: '',
    description: '',
    scoutName: '',
    severity: 'low',
    category: 'behavior'
  });
  const [reports, setReports] = useState(mockReports);
  
  // Helper to filter reports by type and search term
  const filterReports = (type: string) => {
    return reports
      .filter(report => 
        report.type === type && 
        (report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         report.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Handle creating new report
  const handleCreateReport = () => {
    if (!newReport.title || !newReport.description) {
      alert('Please fill in all required fields');
      return;
    }

    const report = {
      id: `report-${Date.now()}`,
      type: newReport.type,
      title: newReport.title,
      description: newReport.description,
      date: new Date().toISOString(),
      status: 'pending',
      scoutName: newReport.scoutName,
      severity: newReport.severity,
      category: newReport.category,
      createdBy: 'current-leader' // Would be from auth context
    };

    setReports(prev => [report, ...prev]);
    setShowCreateModal(false);
    setNewReport({
      type: 'incident',
      title: '',
      description: '',
      scoutName: '',
      severity: 'low',
      category: 'behavior'
    });
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
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-msa-sage hover:bg-msa-sage/90 text-white"
          >
            Create New Report
          </Button>
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

        {/* Create Report Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Report</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type *
                  </label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  >
                    <option value="incident">Incident Report</option>
                    <option value="activity">Activity Report</option>
                    <option value="progress">Progress Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                    placeholder="Enter report title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                    rows={4}
                    placeholder="Provide detailed description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scout Name (if applicable)
                  </label>
                  <input
                    type="text"
                    value={newReport.scoutName}
                    onChange={(e) => setNewReport(prev => ({ ...prev, scoutName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                    placeholder="Enter scout name"
                  />
                </div>

                {newReport.type === 'incident' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity Level
                      </label>
                      <select
                        value={newReport.severity}
                        onChange={(e) => setNewReport(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newReport.category}
                        onChange={(e) => setNewReport(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                      >
                        <option value="behavior">Behavior</option>
                        <option value="safety">Safety</option>
                        <option value="injury">Injury</option>
                        <option value="equipment">Equipment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="bg-msa-sage/10 border border-msa-sage/20 rounded-lg p-3">
                  <p className="text-sm text-msa-charcoal font-medium">📝 Islamic Guidance:</p>
                  <p className="text-xs text-msa-sage">"And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth." - Quran 6:73</p>
                  <p className="text-xs text-msa-sage mt-1">Report truthfully and with justice.</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateReport}
                  className="bg-msa-sage hover:bg-msa-sage/90 text-white"
                >
                  Create Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
