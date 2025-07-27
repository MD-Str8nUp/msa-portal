'use client';

import React, { useState } from 'react';
import { Download, FileText, Users, UserCheck, Calendar, Building } from 'lucide-react';

interface ExcelExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExcelExportDialog({ isOpen, onClose }: ExcelExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedType, setSelectedType] = useState<'scouts' | 'parents' | 'attendance' | 'groups'>('scouts');

  const exportTypes = [
    {
      key: 'scouts' as const,
      title: 'Scout Records',
      description: 'Complete scout profiles including parent details and group assignments',
      icon: Users,
      fields: ['Name', 'Age', 'Group', 'Parent Info', 'Medical', 'Uniform Sizes']
    },
    {
      key: 'parents' as const,
      title: 'Parent Contacts',
      description: 'Parent contact information and their children details',
      icon: UserCheck,
      fields: ['Name', 'Email', 'Phone', 'Children', 'Groups']
    },
    {
      key: 'attendance' as const,
      title: 'Attendance Records',
      description: 'Event attendance tracking and participation data',
      icon: Calendar,
      fields: ['Event', 'Date', 'Scout', 'Status', 'Notes']
    },
    {
      key: 'groups' as const,
      title: 'Group Management',
      description: 'Group information, leaders, and member counts',
      icon: Building,
      fields: ['Group Name', 'Type', 'Scout Count', 'Leaders']
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch(`/api/excel/export?type=${selectedType}&format=xlsx`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `${selectedType}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-emerald-800">Excel Export</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Select the type of data you want to export to Excel format:
          </p>

          <div className="space-y-4 mb-6">
            {exportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <label
                  key={type.key}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedType === type.key
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportType"
                    value={type.key}
                    checked={selectedType === type.key}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-6 h-6 mt-1 ${
                      selectedType === type.key ? 'text-emerald-600' : 'text-gray-500'
                    }`} />
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        selectedType === type.key ? 'text-emerald-800' : 'text-gray-800'
                      }`}>
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {type.fields.map((field) => (
                          <span
                            key={field}
                            className={`text-xs px-2 py-1 rounded ${
                              selectedType === type.key
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">Export Features:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Includes all active records with complete data</li>
              <li>• Excel format compatible with all versions</li>
              <li>• Includes date timestamp in filename</li>
              <li>• Data formatted for easy analysis and reporting</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export to Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}