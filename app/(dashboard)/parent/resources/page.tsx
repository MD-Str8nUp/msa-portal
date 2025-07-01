"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { Button } from "@/components/ui/Button";
import { 
  Download, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  Book, 
  Search, 
  Filter, 
  BookOpen,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function ParentResourcesPage() {
  // Mock resources
  const resources = [
    {
      id: "res-1",
      title: "Scout Handbook - Digital Edition",
      description: "The complete guide to all scout requirements, badges, and activities.",
      type: "document",
      fileType: "pdf",
      fileSize: "12.4 MB",
      date: "2025-01-10",
      tags: ["handbook", "guidelines", "reference"],
      category: "Essential",
      url: "#"
    },
    {
      id: "res-2",
      title: "First Aid Training Video",
      description: "Step-by-step video instructions for basic first aid techniques every scout should know.",
      type: "video",
      fileType: "mp4",
      fileSize: "45.7 MB",
      duration: "12:34",
      date: "2025-03-15",
      tags: ["first aid", "safety", "training"],
      category: "Safety",
      url: "#"
    },
    {
      id: "res-3",
      title: "Summer Camp Preparation Guide",
      description: "Essential packing list and preparation information for summer camp.",
      type: "document",
      fileType: "pdf",
      fileSize: "2.1 MB",
      date: "2025-05-20",
      tags: ["camp", "preparation", "checklist"],
      category: "Events",
      url: "#"
    },
    {
      id: "res-4",
      title: "Knot Tying Tutorial",
      description: "Interactive tutorial for learning essential scout knots.",
      type: "link",
      date: "2025-02-08",
      tags: ["skills", "knots", "tutorial"],
      category: "Skills",
      url: "#"
    },
    {
      id: "res-5",
      title: "Leadership Development Course",
      description: "A series of lessons on developing leadership skills for young scouts.",
      type: "lesson",
      lessonCount: 5,
      date: "2025-04-12",
      tags: ["leadership", "development", "skills"],
      category: "Development",
      progress: 60,
      url: "#"
    },
  ];
  
  // Recent completed lessons (mock data)
  const recentCompletedLessons = [
    {
      id: "lesson-1",
      title: "Environmental Conservation Badge Requirements",
      completedOn: "2025-06-15",
      score: 95
    },
    {
      id: "lesson-2",
      title: "Camping Safety Protocols",
      completedOn: "2025-06-10",
      score: 88
    }
  ];
  
  // Resource categories for filtering
  const resourceCategories = [
    "All",
    "Essential",
    "Safety",
    "Skills",
    "Events",
    "Development"
  ];
  
  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="Resources" 
      userRole="parent"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Learning Resources</h2>
          <p className="text-gray-500">Access educational materials and resources for your scouts</p>
        </div>
        
        {/* Recent Completed Lessons */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Recently Completed Lessons
            </h3>
          </div>
          <div className="p-4">
            {recentCompletedLessons.length > 0 ? (
              <div className="space-y-4">
                {recentCompletedLessons.map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-sm text-gray-500">
                        Completed on <DateTimeDisplay date={lesson.completedOn} format="MMMM d, yyyy" />
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-green-50 text-green-700 font-medium px-2 py-1 rounded text-sm mr-3">
                        {lesson.score}%
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No recently completed lessons.</p>
            )}
          </div>
        </div>
        
        {/* Resource Search & Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search resources..." 
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  Category
                  <ChevronDown size={14} />
                </Button>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                Filter
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {resourceCategories.map(category => (
              <button
                key={category}
                className={`px-3 py-1 text-sm rounded-full ${
                  category === 'All'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden">
              <CardHeader className="pb-3 flex flex-row justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    {resource.type === 'document' && <FileText className="h-4 w-4 mr-2 text-blue-500" />}
                    {resource.type === 'video' && <Video className="h-4 w-4 mr-2 text-red-500" />}
                    {resource.type === 'link' && <LinkIcon className="h-4 w-4 mr-2 text-green-500" />}
                    {resource.type === 'lesson' && <Book className="h-4 w-4 mr-2 text-purple-500" />}
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {resource.category && (
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                        {resource.category}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags && resource.tags.map((tag) => (
                    <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  {resource.fileType && (
                    <div className="flex justify-between">
                      <span>File Type:</span>
                      <span className="uppercase">{resource.fileType}</span>
                    </div>
                  )}
                  {resource.fileSize && (
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{resource.fileSize}</span>
                    </div>
                  )}
                  {resource.duration && (
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{resource.duration}</span>
                    </div>
                  )}
                  {resource.lessonCount && (
                    <div className="flex justify-between">
                      <span>Lessons:</span>
                      <span>{resource.lessonCount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Added:</span>
                    <span><DateTimeDisplay date={resource.date} format="MMM d, yyyy" /></span>
                  </div>
                </div>
                
                {/* Progress bar for lessons */}
                {resource.type === 'lesson' && resource.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{resource.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${resource.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-3">
                <Button variant="outline" className="flex items-center w-full justify-center">
                  {resource.type === 'document' || resource.type === 'video' ? (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  ) : resource.type === 'link' ? (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Open Link
                    </>
                  ) : (
                    <>
                      <Book className="h-4 w-4 mr-2" />
                      Start Lesson
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
