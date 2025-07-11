"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { scoutService } from "@/lib/services/supabaseService";
import { useAuth } from "@/lib/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import { Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function ParentAdminPage() {
  const { userDetails } = useAuth();
  const [scouts, setScouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch scouts for this parent
  useEffect(() => {
    const fetchScouts = async () => {
      if (!userDetails) return;
      
      try {
        setLoading(true);
        const parentScouts = await scoutService.getScoutsByParent(userDetails.id);
        setScouts(parentScouts || []);
      } catch (error) {
        console.error('Error fetching scouts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScouts();
  }, [userDetails]);
  
  // Get first scout for this demo (should be fetched from userDetails.childrenIds in real implementation)
  const selectedScout = scouts.length > 0 ? scouts[0] : null;
  
  // Mock personal information
  const personalInfo = {
    dateOfBirth: "2013-08-15",
    address: "123 Main St, Anytown, US 12345",
    phone: "+1 (555) 123-4567",
    email: "alex.doe@example.com",
    school: "Anytown Middle School",
    grade: "7th Grade"
  };
  
  // Mock medical information
  const medicalInfo = {
    allergies: ["Peanuts", "Dust mites"],
    medications: ["Allergy medication as needed"],
    conditions: ["Mild asthma"],
    doctorName: "Dr. Smith",
    doctorPhone: "+1 (555) 987-6543",
    insuranceProvider: "Health Plus Insurance",
    insuranceNumber: "HP123456789"
  };
  
  // Mock emergency contacts
  const emergencyContacts = [
    {
      id: "contact-1",
      name: "John Doe",
      relationship: "Father",
      phone: "+1 (555) 123-4567",
      email: "john.doe@example.com",
      isAuthorizedForPickup: true
    },
    {
      id: "contact-2",
      name: "Mary Doe",
      relationship: "Grandmother",
      phone: "+1 (555) 234-5678",
      email: "mary.doe@example.com",
      isAuthorizedForPickup: true
    }
  ];
  
  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="Administrative Information" 
      userRole="parent"
    >
      <div className="space-y-6">
        {/* Page Header with Lock Icon */}
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-semibold text-gray-800">Scout Information</h2>
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-gray-500">
          This information is read-only. Please contact your scout leader to request changes.
        </p>
        
        {selectedScout ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="border-b flex justify-start overflow-x-auto">
                <TabsTrigger value="personal" className="px-4 py-2">Personal Information</TabsTrigger>
                <TabsTrigger value="medical" className="px-4 py-2">Medical Information</TabsTrigger>
                <TabsTrigger value="emergency" className="px-4 py-2">Emergency Contacts</TabsTrigger>
              </TabsList>
              
              {/* Personal Information Tab */}
              <TabsContent value="personal" className="p-6">
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Full name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedScout.name}</dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Date of birth</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formatDate(personalInfo.dateOfBirth, "MMMM d, yyyy")}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Home address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{personalInfo.address}</dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{personalInfo.phone}</dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{personalInfo.email}</dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">School</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{personalInfo.school}</dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Grade</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{personalInfo.grade}</dd>
                    </div>
                  </dl>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <div className="inline-flex items-center text-xs text-gray-500">
                    <Lock className="h-4 w-4 mr-1" />
                    Information can only be updated by your scout leader
                  </div>
                </div>
              </TabsContent>
              
              {/* Medical Information Tab */}
              <TabsContent value="medical" className="p-6">
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {medicalInfo.allergies.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {medicalInfo.allergies.map((allergy, index) => (
                              <li key={index}>{allergy}</li>
                            ))}
                          </ul>
                        ) : "None"}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Medications</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {medicalInfo.medications.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {medicalInfo.medications.map((med, index) => (
                              <li key={index}>{med}</li>
                            ))}
                          </ul>
                        ) : "None"}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Medical conditions</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {medicalInfo.conditions.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {medicalInfo.conditions.map((condition, index) => (
                              <li key={index}>{condition}</li>
                            ))}
                          </ul>
                        ) : "None"}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Doctor name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalInfo.doctorName}</dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Doctor phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalInfo.doctorPhone}</dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Insurance provider</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalInfo.insuranceProvider}</dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">Insurance ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{medicalInfo.insuranceNumber}</dd>
                    </div>
                  </dl>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <div className="inline-flex items-center text-xs text-gray-500">
                    <Lock className="h-4 w-4 mr-1" />
                    Information can only be updated by your scout leader
                  </div>
                </div>
              </TabsContent>
              
              {/* Emergency Contacts Tab */}
              <TabsContent value="emergency" className="p-6">
                <div className="space-y-6">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="bg-white shadow overflow-hidden rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{contact.name}</h3>
                        <div className="mt-4 border-t border-gray-200">
                          <dl className="sm:divide-y sm:divide-gray-200">
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contact.relationship}</dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Phone</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contact.phone}</dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Email</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contact.email}</dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Authorized for pickup</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {contact.isAuthorizedForPickup ? "Yes" : "No"}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <div className="inline-flex items-center text-xs text-gray-500">
                    <Lock className="h-4 w-4 mr-1" />
                    Information can only be updated by your scout leader
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No scouts found for this parent.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
