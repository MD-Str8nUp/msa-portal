'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Calendar, 
  User, 
  FileText, 
  Image, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Document {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  type: string;
  created_at: string;
  uploader?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  scout?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  group?: {
    id: string;
    name: string;
  };
}

interface DocumentsListProps {
  scoutId?: string;
  groupId?: string;
  type?: string;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
  canDelete?: boolean;
  currentUserId?: string;
}

export default function DocumentsList({
  scoutId,
  groupId,
  type,
  showUploadButton = false,
  onUploadClick,
  canDelete = false,
  currentUserId
}: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (scoutId) params.append('scoutId', scoutId);
      if (groupId) params.append('groupId', groupId);
      if (type) params.append('type', type);

      const response = await fetch(`/api/documents?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch documents');
      }

      setDocuments(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [scoutId, groupId, type]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = useCallback(async (documentId: string) => {
    if (!canDelete || !confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete document');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete document');
    }
  }, [canDelete]);

  const handleDownload = useCallback((document: Document) => {
    // Open file in new tab for download
    window.open(document.file_url, '_blank');
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getFileIcon = useCallback((fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-green-500" />;
  }, []);

  const getCategoryColor = useCallback((category: string): string => {
    switch (category.toUpperCase()) {
      case 'TRAINING':
        return 'bg-blue-100 text-blue-800';
      case 'ACTIVITY':
        return 'bg-green-100 text-green-800';
      case 'SAFETY':
        return 'bg-red-100 text-red-800';
      case 'ISLAMIC':
        return 'bg-msa-sage/20 text-msa-sage';
      case 'BADGE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const documentTypes = [...new Set(documents.map(doc => doc.type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-msa-sage mr-2" />
        <span className="text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button
          onClick={fetchDocuments}
          variant="outline"
          className="text-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          {documentTypes.length > 0 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {documentTypes.map(docType => (
                  <option key={docType} value={docType}>
                    {docType.charAt(0) + docType.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {showUploadButton && (
          <Button
            onClick={onUploadClick}
            className="bg-msa-sage hover:bg-msa-sage/90 text-white"
          >
            <File className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        )}
      </div>

      {/* Documents grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchTerm || selectedType !== 'all' ? 'No matching documents' : 'No documents yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload your first document to get started'
            }
          </p>
          {showUploadButton && (!searchTerm && selectedType === 'all') && (
            <Button
              onClick={onUploadClick}
              className="bg-msa-sage hover:bg-msa-sage/90 text-white"
            >
              <File className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              {/* File header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon(document.file_type)}
                  <h3 className="font-medium text-gray-900 truncate">
                    {document.title}
                  </h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${getCategoryColor(document.type)}`}>
                  {document.type.charAt(0) + document.type.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Description */}
              {document.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {document.description}
                </p>
              )}

              {/* File info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs text-gray-500">
                  <File className="w-3 h-3 mr-1" />
                  {formatFileSize(document.file_size)}
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(document.created_at)}
                </div>

                {document.uploader && (
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    {document.uploader.first_name} {document.uploader.last_name}
                  </div>
                )}

                {document.scout && (
                  <div className="text-xs text-blue-600">
                    For: {document.scout.first_name} {document.scout.last_name}
                  </div>
                )}

                {document.group && (
                  <div className="text-xs text-green-600">
                    Group: {document.group.name}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(document)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                
                <Button
                  onClick={() => window.open(document.file_url, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>

                {canDelete && document.uploader?.id === currentUserId && (
                  <Button
                    onClick={() => handleDelete(document.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredDocuments.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>
      )}
    </div>
  );
}