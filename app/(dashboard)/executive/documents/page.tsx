"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { FileText, Download, Eye, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";

export default function ExecutiveDocumentsPage() {
  const [documentType, setDocumentType] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    type: "",
    file: null as File | null
  });

  // Mock documents data
  const documents = [
    {
      id: "d1",
      title: "Organization Bylaws",
      description: "Official bylaws of the scout organization",
      date: new Date(2025, 1, 15), // Feb 15, 2025
      type: "policy",
      fileSize: "1.2 MB",
      fileType: "PDF"
    },
    {
      id: "d2",
      title: "Leader Handbook",
      description: "Handbook for all scout leaders",
      date: new Date(2025, 2, 10), // March 10, 2025
      type: "handbook",
      fileSize: "3.5 MB",
      fileType: "PDF"
    },
    {
      id: "d3",
      title: "Event Planning Guide",
      description: "Guidelines for planning scout events",
      date: new Date(2025, 3, 5), // April 5, 2025
      type: "guide",
      fileSize: "2.1 MB",
      fileType: "PDF"
    },
    {
      id: "d4",
      title: "Annual Budget Template",
      description: "Template for annual budget planning",
      date: new Date(2025, 4, 20), // May 20, 2025
      type: "template",
      fileSize: "380 KB",
      fileType: "XLSX"
    },
    {
      id: "d5",
      title: "Insurance Certificate",
      description: "Organization insurance certificate",
      date: new Date(2025, 0, 1), // Jan 1, 2025
      type: "legal",
      fileSize: "450 KB",
      fileType: "PDF"
    },
    {
      id: "d6",
      title: "Permission Slip Template",
      description: "Standard permission slip for events",
      date: new Date(2025, 2, 15), // March 15, 2025
      type: "template",
      fileSize: "215 KB",
      fileType: "DOCX"
    }
  ];

  // Filter documents based on selected type
  const filteredDocuments = documentType === "all" 
    ? documents 
    : documents.filter(doc => doc.type === documentType);

  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Documents" 
      userRole="executive"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Organization Documents</h2>
            <p className="text-gray-500">Manage and distribute important documents</p>
          </div>
          <Button className="flex items-center space-x-2" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </Button>
        </div>

        {/* Document Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/3">
            <Input placeholder="Search documents..." />
          </div>
            <div className="w-full md:w-1/3">
            <Select
              value={documentType}
              onValueChange={(value: string) => setDocumentType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="policy">Policy Documents</SelectItem>
                <SelectItem value="handbook">Handbooks</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="legal">Legal Documents</SelectItem>
              </SelectContent>
            </Select>
            </div>
        </div>
        
        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(document => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <FileText className="w-10 h-10 text-blue-500" />
                    <div className="ml-3">
                      <h3 className="text-md font-semibold truncate max-w-[150px] sm:max-w-[200px]">{document.title}</h3>
                      <p className="text-xs text-gray-500 uppercase">{document.fileType}</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded px-2 py-1">
                    <span className="text-xs">{document.fileSize}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 flex-grow">{document.description}</p>
                
                <div className="mt-4 text-xs text-gray-500">
                  <p>Updated on <DateTimeDisplay date={document.date} format="short" /></p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 flex justify-center items-center text-xs h-9">
                    <Eye className="w-3 h-3 mr-1" /> View
                  </Button>
                  <Button className="flex-1 flex justify-center items-center text-xs h-9 bg-blue-500 hover:bg-blue-600">
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                  <Button className="w-9 h-9 flex justify-center items-center bg-red-500 hover:bg-red-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload Document Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doc-title" className="text-right">
                Title
              </Label>
              <Input
                id="doc-title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                className="col-span-3"
                placeholder="Document title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doc-description" className="text-right">
                Description
              </Label>
              <textarea
                id="doc-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                className="col-span-3 flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Brief description of the document"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doc-type" className="text-right">
                Type
              </Label>
              <select
                id="doc-type"
                value={uploadForm.type}
                onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select document type</option>
                <option value="policy">Policy Document</option>
                <option value="handbook">Handbook</option>
                <option value="guide">Guide</option>
                <option value="template">Template</option>
                <option value="legal">Legal Document</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doc-file" className="text-right">
                File
              </Label>
              <div className="col-span-3">
                <Input
                  id="doc-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // TODO: Implement document upload functionality
              console.log('Uploading document:', uploadForm);
              setIsUploadModalOpen(false);
              setUploadForm({ title: '', description: '', type: '', file: null });
            }}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
