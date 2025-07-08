// MSA Admin Upload Interface - Updated for Complex Family Data
// Handles multiple children per family and detailed group assignments

'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Download, CheckCircle, AlertTriangle, XCircle, FileText, Users, UserCheck, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { msaTemplateGenerator } from '@/lib/services/excel-template-generator';

interface ValidationResult {
  errors: string[];
  warnings: string[];
  validRecords: number;
  totalRecords: number;
  multipleChildrenFamilies?: number;
}

interface UploadedData {
  type: 'families' | 'staff';
  data: any[];
  validation: ValidationResult;
  fileName: string;
}

export default function MSAAdminUploadInterface() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'validate' | 'confirm' | 'success'>('upload');

  // Simplified validation - only flag truly critical issues
  const validateExcelData = (data: any[], type: 'families' | 'staff'): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validRecords = 0;
    const familyEmails = new Set();
    const multipleChildrenEmails = new Set();

    if (type === 'families') {
      data.forEach((row, index) => {
        const rowNum = index + 2;
        
        // Skip completely empty rows
        const hasAnyData = Object.values(row).some(value => 
          value !== null && value !== undefined && value !== ''
        );
        
        if (!hasAnyData) {
          return; // Skip empty rows silently
        }
        
        // Track multiple children families
        const email = row['Parent Email*'] || row['parent_email'];
        if (email) {
          if (familyEmails.has(email)) {
            multipleChildrenEmails.add(email);
          }
          familyEmails.add(email);
        }
        
        // Only flag critical missing data - flexible column header matching
        const parentFirstName = row['Parent First Name*'] || row['parent_first_name'] || row['Parent First Name'] || row['parent first name'] || row['first_name'] || row['firstname'];
        const parentLastName = row['Parent Last Name*'] || row['parent_last_name'] || row['Parent Last Name'] || row['parent last name'] || row['last_name'] || row['lastname'];
        const parentEmail = row['Parent Email*'] || row['parent_email'] || row['Parent Email'] || row['parent email'] || row['email'];
        const childFirstName = row['Child First Name*'] || row['child_first_name'] || row['Child First Name'] || row['child first name'] || row['child_name'];
        const childAge = row['Child Age*'] || row['child_age'] || row['Child Age'] || row['child age'] || row['age'];
        
        // Get first non-empty value from any column that looks like it has data
        const firstRowValues = Object.values(row).filter(val => val && val.toString().trim() !== '');
        
        if (firstRowValues.length === 0) {
          return; // Completely empty row
        }
        
        // If we have any data, try to process it
        let hasParentName = parentFirstName || parentLastName;
        let hasChildName = childFirstName;
        
        if (!hasParentName && !hasChildName) {
          // Check if any column has a name-like value
          const possibleNames = firstRowValues.filter(val => 
            typeof val === 'string' && 
            val.length > 1 && 
            /^[a-zA-Z\s]+$/.test(val) &&
            !val.includes('@') &&
            !val.includes('MSA_') &&
            !val.includes('NSW')
          );
          
          if (possibleNames.length === 0) {
            warnings.push(`Row ${rowNum}: No recognizable names found - skipping this row`);
            return;
          } else {
            hasParentName = true; // We found some names
          }
        }
        
        if (hasParentName && !parentEmail) {
          warnings.push(`Row ${rowNum}: Parent name provided but email missing - will need email for portal access`);
        }
        
        if (parentEmail && !/\S+@\S+\.\S+/.test(parentEmail)) {
          warnings.push(`Row ${rowNum}: Email format looks incorrect: ${parentEmail}`);
        }
        
        // Child data processing - use already defined childAge variable
        if (childFirstName && childAge) {
          if (childAge < 5 || childAge > 18) {
            warnings.push(`Row ${rowNum}: ${childFirstName} age ${childAge} is outside normal range (5-18)`);
          }
          validRecords++;
        } else if (childFirstName && !childAge) {
          warnings.push(`Row ${rowNum}: ${childFirstName} needs an age for group assignment`);
          validRecords++; // Still count as valid, we'll handle missing age
        } else if (hasParentName) {
          validRecords++; // Parent-only record is fine
        }
      });
      
      return {
        errors,
        warnings,
        validRecords,
        totalRecords: data.filter(row => 
          Object.values(row).some(value => value !== null && value !== undefined && value !== '')
        ).length,
        multipleChildrenFamilies: multipleChildrenEmails.size
      };
      
    } else if (type === 'staff') {
      data.forEach((row, index) => {
        const rowNum = index + 2;
        
        // Skip completely empty rows
        const hasAnyData = Object.values(row).some(value => 
          value !== null && value !== undefined && value !== ''
        );
        
        if (!hasAnyData) {
          return;
        }
        
        const name = row['Full Name*'] || row['name'];
        const email = row['Email*'] || row['email'];
        
        if (!name) {
          warnings.push(`Row ${rowNum}: Staff member needs a name`);
          return;
        }
        
        if (!email) {
          warnings.push(`Row ${rowNum}: ${name} needs an email for portal access`);
        }
        
        validRecords++;
      });
    }

    return {
      errors,
      warnings,
      validRecords,
      totalRecords: data.filter(row => 
        Object.values(row).some(value => value !== null && value !== undefined && value !== '')
      ).length
    };
  };

  // Handle Excel file upload and validation
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, type: 'families' | 'staff') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const validation = validateExcelData(data, type);
      
      const uploadedData: UploadedData = {
        type,
        data,
        validation,
        fileName: file.name
      };

      setUploadedFiles(prev => {
        const filtered = prev.filter(f => f.type !== type);
        return [...filtered, uploadedData];
      });

      setCurrentStep('validate');
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert('Error reading Excel file. Please ensure it\'s a valid .xlsx file.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Enhanced template download using our comprehensive generator
  const downloadTemplate = async (type: 'families' | 'staff') => {
    try {
      let workbook;
      let filename;
      
      if (type === 'families') {
        workbook = msaTemplateGenerator.createFamilyApplicationsTemplate();
        filename = 'MSA_Family_Applications_Enhanced_Template.xlsx';
      } else {
        workbook = msaTemplateGenerator.createStaffManagementTemplate();
        filename = 'MSA_Staff_Management_Enhanced_Template.xlsx';
      }
      
      // Download the file
      XLSX.writeFile(workbook, filename);
      
    } catch (error) {
      console.error('Error generating template:', error);
      alert('Error generating template. Please try again.');
    }
  };

  // Process and import the data
  const handleImport = async () => {
    setIsProcessing(true);
    
    try {
      for (const fileData of uploadedFiles) {
        const response = await fetch('/api/import-excel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: fileData.type,
            data: fileData.data
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to import ${fileData.type} data`);
        }
      }

      setCurrentStep('success');
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing data. Please try again or contact technical support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">
            Mi&apos;raj Scouts Academy - Enhanced Data Management
          </h1>
          <p className="text-emerald-600 mb-4">
            Welcome Sarah! Manage 79+ families with multiple children and detailed group assignments.
          </p>
          
          {/* Key Features Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-800 mb-2">Enhanced Features for MSA Community:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Multiple Children Support:</strong> One row per child, repeat parent details</li>
                  <li>• <strong>Detailed Group Assignments:</strong> Age 5→Joeys A, 6→Joeys B, 7→Joeys C, 8→Cubs A, etc.</li>
                  <li>• <strong>Complete Family Profiles:</strong> Address, phone, school, medical info, uniform sizes</li>
                  <li>• <strong>Real MSA Data Structure:</strong> Matches your 79 families with Islamic naming conventions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: 'upload', label: 'Upload Files', icon: Upload },
              { step: 'validate', label: 'Validate Data', icon: CheckCircle },
              { step: 'confirm', label: 'Confirm Import', icon: UserCheck },
              { step: 'success', label: 'Complete', icon: CheckCircle }
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep === step 
                    ? 'bg-emerald-600 text-white' 
                    : index < ['upload', 'validate', 'confirm', 'success'].indexOf(currentStep)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="ml-2 text-sm text-emerald-700">{label}</span>
                {index < 3 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Upload Files */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            {/* Template Downloads */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Step 1: Download Enhanced Templates
              </h2>
              <p className="text-gray-600 mb-4">
                Download the updated Excel templates with detailed group assignments and multiple children support:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => downloadTemplate('families')}
                  className="flex items-center justify-center p-4 border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                >
                  <Users className="w-8 h-8 text-emerald-600 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold text-emerald-800">Enhanced Family Applications</div>
                    <div className="text-sm text-gray-600">Complete profiles + multiple children support</div>
                    <div className="text-xs text-emerald-600 mt-1">
                      24 fields • Detailed group assignments • Real MSA examples
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => downloadTemplate('staff')}
                  className="flex items-center justify-center p-4 border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                >
                  <UserCheck className="w-8 h-8 text-emerald-600 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold text-emerald-800">Enhanced Staff Management</div>
                    <div className="text-sm text-gray-600">Detailed roles + qualifications + WWCC tracking</div>
                    <div className="text-xs text-emerald-600 mt-1">
                      12 fields • Role assignments • Emergency contacts
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Important Notes */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">📋 Multiple Children Instructions:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>One row per child</strong> (not per family)</li>
                  <li>• <strong>Repeat parent details</strong> for each child in the family</li>
                  <li>• <strong>Use sequential submission IDs</strong> (MSA_80, MSA_81, MSA_82, etc.)</li>
                  <li>• <strong>Group assignment is automatic</strong> based on child&apos;s age</li>
                </ul>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Step 2: Upload Your Completed Excel Files
              </h2>
              <p className="text-gray-600 mb-4">
                Upload your completed Excel files. The system will validate all data including multiple children families:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Family Applications Upload */}
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center">
                  <FileText className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-emerald-800 mb-2">Family Applications</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload enhanced family data with multiple children support
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'families')}
                    className="hidden"
                    id="families-upload"
                    disabled={isProcessing}
                  />
                  <label
                    htmlFor="families-upload"
                    className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors inline-block"
                  >
                    {isProcessing ? 'Processing...' : 'Choose File'}
                  </label>
                </div>

                {/* Staff Management Upload */}
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center">
                  <UserCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-emerald-800 mb-2">Staff Management</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload enhanced staff data with detailed role assignments
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'staff')}
                    className="hidden"
                    id="staff-upload"
                    disabled={isProcessing}
                  />
                  <label
                    htmlFor="staff-upload"
                    className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors inline-block"
                  >
                    {isProcessing ? 'Processing...' : 'Choose File'}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enhanced Validation Results */}
        {currentStep === 'validate' && uploadedFiles.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-emerald-800 mb-4">
                Enhanced Data Validation Results
              </h2>
              
              {uploadedFiles.map((fileData, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 capitalize">
                    {fileData.type} Data - {fileData.fileName}
                  </h3>
                  
                  {/* Enhanced Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">{fileData.validation.validRecords}</div>
                      <div className="text-sm text-green-800">Ready to Import</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{fileData.validation.totalRecords}</div>
                      <div className="text-sm text-blue-800">Total Records</div>
                    </div>
                    {fileData.validation.warnings.length > 0 && (
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">{fileData.validation.warnings.length}</div>
                        <div className="text-sm text-yellow-800">Suggestions</div>
                      </div>
                    )}
                    {fileData.validation.multipleChildrenFamilies !== undefined && fileData.validation.multipleChildrenFamilies > 0 && (
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">{fileData.validation.multipleChildrenFamilies}</div>
                        <div className="text-sm text-purple-800">Multi-Child Families</div>
                      </div>
                    )}
                  </div>

                  {/* Errors - only for real blocking issues */}
                  {fileData.validation.errors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        Issues Found (Will Not Import)
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm max-h-40 overflow-y-auto">
                        {fileData.validation.errors.map((error, i) => (
                          <li key={i} className="text-red-600">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings - informational only */}
                  {fileData.validation.warnings.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Notes & Suggestions (Data Will Still Import)
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm max-h-40 overflow-y-auto">
                        {fileData.validation.warnings.slice(0, 10).map((warning, i) => (
                          <li key={i} className="text-blue-600">{warning}</li>
                        ))}
                        {fileData.validation.warnings.length > 10 && (
                          <li className="text-blue-600">...and {fileData.validation.warnings.length - 10} more suggestions</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-6 py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                >
                  Upload Different Files
                </button>
                
                {/* Always allow import if we have valid records */}
                {uploadedFiles.some(f => f.validation.validRecords > 0) ? (
                  <button
                    onClick={() => setCurrentStep('confirm')}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    Proceed to Import ({uploadedFiles.reduce((sum, f) => sum + f.validation.validRecords, 0)} records)
                  </button>
                ) : (
                  <div className="text-gray-500 text-sm flex items-center">
                    No valid records found to import
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Import */}
        {currentStep === 'confirm' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-emerald-800 mb-4">
              Confirm Enhanced Data Import
            </h2>
            <p className="text-gray-600 mb-6">
              Review the summary below and click &quot;Import Data&quot; to add this information to the MSA Portal:
            </p>
            
            {uploadedFiles.map((fileData, index) => (
              <div key={index} className="mb-4 p-4 bg-emerald-50 rounded-lg">
                <h3 className="font-semibold capitalize">{fileData.type} Data</h3>
                <p className="text-sm text-gray-600">
                  {fileData.validation.validRecords} valid records will be imported from {fileData.fileName}
                </p>
                {fileData.validation.multipleChildrenFamilies !== undefined && fileData.validation.multipleChildrenFamilies > 0 && (
                  <p className="text-sm text-purple-600 mt-1">
                    Including {fileData.validation.multipleChildrenFamilies} families with multiple children
                  </p>
                )}
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep('validate')}
                className="px-6 py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
              >
                Back to Validation
              </button>
              <button
                onClick={handleImport}
                disabled={isProcessing}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Importing Enhanced Data...' : 'Import Data'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 'success' && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-emerald-800 mb-2">
              Enhanced Import Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              All family and staff data has been successfully imported with detailed group assignments. 
              Multiple children families have been properly processed.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">What happened:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Welcome emails sent to all new families</li>
                <li>• Children assigned to appropriate groups (Joeys A/B/C, Cubs A/B/C, Scouts A/B/C, Rovers)</li>
                <li>• Staff members given appropriate portal access and group assignments</li>
                <li>• All relationships and group memberships created</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setCurrentStep('upload');
                setUploadedFiles([]);
              }}
              className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Import More Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}