"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

interface Resource {
  id: string;
  name: string;
  type: 'document' | 'video' | 'image' | 'audio' | 'link';
  category: 'training' | 'activity' | 'safety' | 'islamic' | 'badges' | 'general';
  size: string;
  uploadDate: string;
  uploadedBy: string;
  description: string;
  assignedGroups: string[];
  assignedAcademies: string[];
  downloadCount: number;
  isPublic: boolean;
  tags: string[];
  fileUrl: string;
}

interface ResourceFolder {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  resources: Resource[];
  subfolders: ResourceFolder[];
  permissions: {
    academy: string[];
    groups: string[];
    roles: string[];
  };
}

interface ResourceHubProps {
  className?: string;
}

const ResourceHub: React.FC<ResourceHubProps> = ({ className = "" }) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    category: 'general',
    assignedGroups: [] as string[],
    assignedAcademies: [] as string[],
    isPublic: false,
    tags: ''
  });

  // Mock resource data
  const [resources, setResources] = useState<Resource[]>([
    {
      id: 'res-1',
      name: 'Scout Handbook 2025',
      type: 'document',
      category: 'training',
      size: '2.5 MB',
      uploadDate: '2025-01-15',
      uploadedBy: 'Ahmad Rahman',
      description: 'Complete scouting handbook with Islamic values integration',
      assignedGroups: ['group-1', 'group-2'],
      assignedAcademies: ['Main Academy'],
      downloadCount: 45,
      isPublic: true,
      tags: ['handbook', 'training', 'islamic'],
      fileUrl: '/resources/scout-handbook-2025.pdf'
    },
    {
      id: 'res-2',
      name: 'First Aid Training Video',
      type: 'video',
      category: 'safety',
      size: '125 MB',
      uploadDate: '2025-01-10',
      uploadedBy: 'Fatima Malik',
      description: 'Comprehensive first aid training for scout leaders',
      assignedGroups: ['group-1', 'group-3'],
      assignedAcademies: ['Main Academy', 'South Branch'],
      downloadCount: 23,
      isPublic: false,
      tags: ['first-aid', 'safety', 'training'],
      fileUrl: '/resources/first-aid-training.mp4'
    },
    {
      id: 'res-3',
      name: 'Islamic History Activities',
      type: 'document',
      category: 'islamic',
      size: '1.8 MB',
      uploadDate: '2025-01-08',
      uploadedBy: 'Hassan Omar',
      description: 'Interactive activities teaching Islamic history through scouting',
      assignedGroups: ['group-2'],
      assignedAcademies: ['North Branch'],
      downloadCount: 31,
      isPublic: true,
      tags: ['islamic', 'history', 'activities'],
      fileUrl: '/resources/islamic-history-activities.pdf'
    },
    {
      id: 'res-4',
      name: 'Badge Requirements Checklist',
      type: 'document',
      category: 'badges',
      size: '850 KB',
      uploadDate: '2025-01-05',
      uploadedBy: 'Aisha Khan',
      description: 'Detailed checklist for all badge requirements and assessments',
      assignedGroups: ['group-1', 'group-2', 'group-3'],
      assignedAcademies: ['Main Academy', 'North Branch', 'South Branch'],
      downloadCount: 67,
      isPublic: true,
      tags: ['badges', 'requirements', 'assessment'],
      fileUrl: '/resources/badge-requirements.pdf'
    },
    {
      id: 'res-5',
      name: 'Outdoor Cooking Recipe Book',
      type: 'document',
      category: 'activity',
      size: '3.2 MB',
      uploadDate: '2024-12-28',
      uploadedBy: 'Yusuf Abdullah',
      description: 'Halal recipes and cooking techniques for outdoor activities',
      assignedGroups: ['group-1'],
      assignedAcademies: ['Main Academy'],
      downloadCount: 19,
      isPublic: false,
      tags: ['cooking', 'outdoor', 'halal', 'recipes'],
      fileUrl: '/resources/outdoor-cooking.pdf'
    }
  ]);

  // Mock folder structure
  const folders: ResourceFolder[] = [
    {
      id: 'folder-1',
      name: 'Training Materials',
      description: 'Official training resources for leaders and scouts',
      resources: [],
      subfolders: [],
      permissions: {
        academy: ['Main Academy', 'North Branch', 'South Branch'],
        groups: ['group-1', 'group-2', 'group-3'],
        roles: ['leader', 'executive']
      }
    },
    {
      id: 'folder-2',
      name: 'Islamic Resources',
      description: 'Islamic education and character development materials',
      resources: [],
      subfolders: [],
      permissions: {
        academy: ['Main Academy', 'North Branch', 'South Branch'],
        groups: ['group-1', 'group-2', 'group-3'],
        roles: ['scout', 'parent', 'leader', 'executive']
      }
    },
    {
      id: 'folder-3',
      name: 'Safety Protocols',
      description: 'Safety guidelines and emergency procedures',
      resources: [],
      subfolders: [],
      permissions: {
        academy: ['Main Academy', 'North Branch', 'South Branch'],
        groups: ['group-1', 'group-2', 'group-3'],
        roles: ['leader', 'executive']
      }
    }
  ];

  // Available groups and academies for assignment
  const groups = [
    { id: 'group-1', name: 'Eagle Scouts', academy: 'Main Academy' },
    { id: 'group-2', name: 'Wolf Pack', academy: 'North Branch' },
    { id: 'group-3', name: 'Trailblazers', academy: 'South Branch' }
  ];

  const academies = ['Main Academy', 'North Branch', 'South Branch'];

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Resource statistics
  const resourceStats = {
    totalResources: resources.length,
    totalDownloads: resources.reduce((sum, resource) => sum + resource.downloadCount, 0),
    publicResources: resources.filter(r => r.isPublic).length,
    recentUploads: resources.filter(r => {
      const uploadDate = new Date(r.uploadDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate >= weekAgo;
    }).length
  };

  // Get type icon
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'document':
        return '📄';
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      case 'audio':
        return '🎵';
      case 'link':
        return '🔗';
      default:
        return '📁';
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'training':
        return 'bg-blue-100 text-blue-800';
      case 'activity':
        return 'bg-green-100 text-green-800';
      case 'safety':
        return 'bg-red-100 text-red-800';
      case 'islamic':
        return 'bg-msa-sage/20 text-msa-sage';
      case 'badges':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle file upload simulation
  const handleFileUpload = () => {
    if (!newResource.name || !newResource.description) {
      alert('Please fill in all required fields');
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Add resource to list
          const resource: Resource = {
            id: `res-${Date.now()}`,
            name: newResource.name,
            type: 'document', // Default type for simulation
            category: newResource.category as any,
            size: '1.2 MB', // Mock size
            uploadDate: new Date().toISOString().split('T')[0],
            uploadedBy: 'Executive Admin',
            description: newResource.description,
            assignedGroups: newResource.assignedGroups,
            assignedAcademies: newResource.assignedAcademies,
            downloadCount: 0,
            isPublic: newResource.isPublic,
            tags: newResource.tags.split(',').map(tag => tag.trim()),
            fileUrl: `/resources/${newResource.name.toLowerCase().replace(/\s+/g, '-')}`
          };
          setResources([resource, ...resources]);
          setShowUploadModal(false);
          setNewResource({
            name: '',
            description: '',
            category: 'general',
            assignedGroups: [],
            assignedAcademies: [],
            isPublic: false,
            tags: ''
          });
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Handle group assignment toggle
  const toggleGroupAssignment = (groupId: string) => {
    setNewResource(prev => ({
      ...prev,
      assignedGroups: prev.assignedGroups.includes(groupId)
        ? prev.assignedGroups.filter(id => id !== groupId)
        : [...prev.assignedGroups, groupId]
    }));
  };

  // Handle academy assignment toggle
  const toggleAcademyAssignment = (academy: string) => {
    setNewResource(prev => ({
      ...prev,
      assignedAcademies: prev.assignedAcademies.includes(academy)
        ? prev.assignedAcademies.filter(a => a !== academy)
        : [...prev.assignedAcademies, academy]
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Resource Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-msa-sage">{resourceStats.totalResources}</div>
            <p className="text-xs text-msa-sage/70">All file types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{resourceStats.totalDownloads}</div>
            <p className="text-xs text-msa-sage/70">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Public Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resourceStats.publicResources}</div>
            <p className="text-xs text-msa-sage/70">Openly accessible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{resourceStats.recentUploads}</div>
            <p className="text-xs text-msa-sage/70">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sm:max-w-xs"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="training">Training</option>
                <option value="activity">Activities</option>
                <option value="safety">Safety</option>
                <option value="islamic">Islamic</option>
                <option value="badges">Badges</option>
                <option value="general">General</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="document">Documents</option>
                <option value="video">Videos</option>
                <option value="image">Images</option>
                <option value="audio">Audio</option>
                <option value="link">Links</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowFolderModal(true)}
                variant="outline"
              >
                Create Folder
              </Button>
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-msa-sage hover:bg-msa-sage/90 text-white"
              >
                Upload Resource
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Resources Tab */}
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
              <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                    <div className="flex-1">
                      <CardTitle className="text-sm">{resource.name}</CardTitle>
                      <p className="text-xs text-gray-500">{resource.size}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(resource.category)}`}>
                      {resource.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{resource.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Uploaded by:</span>
                      <span>{resource.uploadedBy}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Date:</span>
                      <span>{resource.uploadDate}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Downloads:</span>
                      <span>{resource.downloadCount}</span>
                    </div>
                  </div>

                  {resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-xs font-medium">Assigned to:</div>
                    {resource.assignedGroups.length > 0 && (
                      <div className="text-xs text-blue-600">
                        Groups: {resource.assignedGroups.map(gId => 
                          groups.find(g => g.id === gId)?.name
                        ).join(', ')}
                      </div>
                    )}
                    {resource.assignedAcademies.length > 0 && (
                      <div className="text-xs text-green-600">
                        Academies: {resource.assignedAcademies.join(', ')}
                      </div>
                    )}
                    {resource.isPublic && (
                      <div className="text-xs text-msa-sage">
                        🌐 Public access
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredResources.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No resources found matching your criteria
            </div>
          )}
        </TabsContent>

        {/* Folders Tab */}
        <TabsContent value="folders" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map(folder => (
              <Card key={folder.id} className="p-6 hover:bg-msa-sage/5 cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl mb-4">📁</div>
                  <h3 className="font-semibold text-msa-charcoal">{folder.name}</h3>
                  <p className="text-sm text-msa-sage/70 mt-2">{folder.description}</p>
                  <div className="mt-3 text-xs text-gray-500">
                    Access: {folder.permissions.academy.length} academies, {folder.permissions.groups.length} groups
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Download Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resources.slice(0, 5).map(resource => (
                    <div key={resource.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{resource.name}</div>
                        <div className="text-xs text-gray-500">{resource.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{resource.downloadCount}</div>
                        <div className="text-xs text-gray-500">downloads</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Training Materials</span>
                    <span className="font-bold">{resources.filter(r => r.category === 'training').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Islamic Resources</span>
                    <span className="font-bold">{resources.filter(r => r.category === 'islamic').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activity Materials</span>
                    <span className="font-bold">{resources.filter(r => r.category === 'activity').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Protocols</span>
                    <span className="font-bold">{resources.filter(r => r.category === 'safety').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Badge Requirements</span>
                    <span className="font-bold">{resources.filter(r => r.category === 'badges').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload New Resource</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
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
                  Resource Name *
                </label>
                <Input
                  value={newResource.name}
                  onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter resource name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                  rows={3}
                  placeholder="Describe the resource and its purpose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newResource.category}
                  onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="training">Training</option>
                  <option value="activity">Activities</option>
                  <option value="safety">Safety</option>
                  <option value="islamic">Islamic</option>
                  <option value="badges">Badges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Upload
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-msa-sage transition-colors">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-gray-500">Drop files here or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">Supports: PDF, DOC, MP4, JPG, PNG (Max 100MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Groups
                </label>
                <div className="space-y-2">
                  {groups.map(group => (
                    <label key={group.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newResource.assignedGroups.includes(group.id)}
                        onChange={() => toggleGroupAssignment(group.id)}
                        className="rounded"
                      />
                      <span className="ml-2 text-sm">{group.name} ({group.academy})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Academies
                </label>
                <div className="space-y-2">
                  {academies.map(academy => (
                    <label key={academy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newResource.assignedAcademies.includes(academy)}
                        onChange={() => toggleAcademyAssignment(academy)}
                        className="rounded"
                      />
                      <span className="ml-2 text-sm">{academy}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <Input
                  value={newResource.tags}
                  onChange={(e) => setNewResource(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., training, safety, beginner"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newResource.isPublic}
                  onChange={(e) => setNewResource(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded"
                />
                <span className="ml-2 text-sm">Make this resource publicly accessible</span>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-msa-sage h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="bg-msa-sage/10 border border-msa-sage/20 rounded-lg p-3">
                <p className="text-sm text-msa-charcoal font-medium">📚 Knowledge Sharing:</p>
                <p className="text-xs text-msa-sage">"And say: My Lord, increase me in knowledge" - Quran 20:114</p>
                <p className="text-xs text-msa-sage mt-1">Share beneficial knowledge to strengthen our Islamic community</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleFileUpload}
                disabled={uploadProgress > 0 && uploadProgress < 100}
                className="bg-msa-sage hover:bg-msa-sage/90 text-white"
              >
                {uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 'Upload Resource'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Islamic Values Message */}
      <Card className="bg-gradient-to-r from-msa-sage/5 to-msa-golden/5 border-msa-sage/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📖</div>
            <div>
              <h3 className="text-lg font-semibold text-msa-charcoal">Knowledge & Resource Sharing</h3>
              <p className="text-sm text-msa-sage/80 mt-1">
                "And say: My Lord, increase me in knowledge" - Quran 20:114
              </p>
              <p className="text-xs text-msa-sage/70 mt-2">
                Every resource shared is an opportunity to strengthen our Islamic community's learning and development.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceHub;