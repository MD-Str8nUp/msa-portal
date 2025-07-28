'use client';

// Admin Data Management Page for Sarah
import { useState } from 'react';
import MSAAdminUploadInterface from '@/components/admin/MSAAdminUploadInterface';
import FileUploadDialog from '@/components/ui/FileUploadDialog';
import DocumentsList from '@/components/ui/DocumentsList';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function DataManagementPage() {
  const { userDetails } = useAuth();
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  return (
    <div className="space-y-8">
      {/* Existing Excel Upload Interface */}
      <MSAAdminUploadInterface />
      
      {/* File Sharing Management Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              File Sharing Management
            </h3>
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-msa-sage hover:bg-msa-sage/90 text-white"
            >
              Upload Document
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Manage all shared documents across the MSA Portal. Upload files, organize by category, and control access permissions.
          </p>
          <DocumentsList
            showUploadButton={false}
            canDelete={true}
            currentUserId={userDetails?.id}
          />
        </div>
      </div>

      {/* File Upload Dialog */}
      {userDetails && (
        <FileUploadDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          uploaderId={userDetails.id}
          onUploadSuccess={() => {
            setShowUploadDialog(false);
          }}
        />
      )}
    </div>
  );
}