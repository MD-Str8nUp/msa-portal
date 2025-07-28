'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, File, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (document: any) => void;
  uploaderId: string;
  scoutId?: string;
  groupId?: string;
}

interface UploadState {
  file: File | null;
  title: string;
  description: string;  
  type: string;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

const FILE_TYPES = [
  { value: 'GENERAL', label: 'General Document' },
  { value: 'TRAINING', label: 'Training Material' },
  { value: 'ACTIVITY', label: 'Activity Resource' },
  { value: 'SAFETY', label: 'Safety Protocol' },
  { value: 'ISLAMIC', label: 'Islamic Resource' },
  { value: 'BADGE', label: 'Badge Requirement' }
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'jpg', 'jpeg', 'png', 'gif', 'webp'];

export default function FileUploadDialog({
  isOpen,
  onClose,
  onUploadSuccess,
  uploaderId,
  scoutId,
  groupId
}: FileUploadDialogProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    title: '',
    description: '',
    type: 'GENERAL',
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setUploadState({
      file: null,
      title: '',
      description: '',
      type: 'GENERAL',
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
  }, []);

  const handleClose = useCallback(() => {
    if (!uploadState.uploading) {
      resetForm();
      onClose();
    }
  }, [uploadState.uploading, resetForm, onClose]);

  const validateFile = useCallback((file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return `File type not allowed. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }

    // Size limits based on file type
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
    const isDocument = ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension);
    
    const maxSize = isImage ? 5 * 1024 * 1024 : isDocument ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`;
    }

    if (file.size === 0) {
      return 'File is empty';
    }

    return null;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    
    setUploadState(prev => ({
      ...prev,
      file,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''), // Set title to filename without extension
      error,
      success: false
    }));
  }, [validateFile]);

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    const file = files[0];
    
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!uploadState.file || !uploadState.title.trim() || uploadState.error) {
      return;
    }

    setUploadState(prev => ({ ...prev, uploading: true, progress: 0, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('title', uploadState.title.trim());
      formData.append('description', uploadState.description.trim());
      formData.append('type', uploadState.type);
      formData.append('uploaderId', uploaderId);
      
      if (scoutId) formData.append('scoutId', scoutId);
      if (groupId) formData.append('groupId', groupId);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        success: true
      }));

      if (onUploadSuccess) {
        onUploadSuccess(result.data);
      }

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  }, [uploadState, uploaderId, scoutId, groupId, onUploadSuccess, handleClose]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-msa-charcoal">Upload File</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={uploadState.uploading}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              uploadState.file
                ? 'border-msa-sage bg-msa-sage/5'
                : 'border-gray-300 hover:border-msa-sage hover:bg-msa-sage/5'
            }`}
          >
            {uploadState.file ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <File className="w-12 h-12 text-msa-sage" />
                </div>
                <div>
                  <p className="font-medium text-msa-charcoal">{uploadState.file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(uploadState.file.size)}</p>
                </div>
                {uploadState.error && (
                  <div className="flex items-center justify-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {uploadState.error}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drop your file here or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-msa-sage hover:text-msa-sage/80 underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports: PDF, DOC, DOCX, TXT, RTF, JPG, PNG, GIF, WebP
                  </p>
                  <p className="text-xs text-gray-400">
                    Max size: 10MB for documents, 5MB for images
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={uploadState.title}
                onChange={(e) => setUploadState(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter file title"
                disabled={uploadState.uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={uploadState.description}
                onChange={(e) => setUploadState(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent disabled:bg-gray-50"
                rows={3}
                disabled={uploadState.uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={uploadState.type}
                onChange={(e) => setUploadState(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent disabled:bg-gray-50"
                disabled={uploadState.uploading}
              >
                {FILE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadState.uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadState.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-msa-sage h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadState.success && (
            <div className="flex items-center justify-center text-green-600 bg-green-50 p-3 rounded-lg">
              <Check className="w-5 h-5 mr-2" />
              File uploaded successfully!
            </div>
          )}

          {/* Error Message */}
          {uploadState.error && !uploadState.file && (
            <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 mr-2" />
              {uploadState.error}
            </div>
          )}

          {/* Islamic Values Message */}
          <div className="bg-gradient-to-r from-msa-sage/10 to-msa-golden/10 border border-msa-sage/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-lg">📚</div>
              <div>
                <p className="text-sm font-medium text-msa-charcoal">Knowledge Sharing</p>
                <p className="text-xs text-msa-sage/80 mt-1">
                  "And say: My Lord, increase me in knowledge" - Quran 20:114
                </p>
                <p className="text-xs text-msa-sage/70 mt-1">
                  Share beneficial knowledge to strengthen our Islamic community
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploadState.uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!uploadState.file || !uploadState.title.trim() || uploadState.uploading || !!uploadState.error}
            className="bg-msa-sage hover:bg-msa-sage/90 text-white"
          >
            {uploadState.uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}