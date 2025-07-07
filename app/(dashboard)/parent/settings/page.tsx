"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Bell, Lock, User, Smartphone, Mail, Shield, Moon } from "lucide-react";

export default function ParentSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [eventReminders, setEventReminders] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');
  
  const handleSaveProfile = () => {
    alert("Profile changes saved successfully!");
  };
  
  const handleUpdatePassword = () => {
    alert("Password updated successfully!");
  };
  
  const handleSavePreferences = () => {
    alert("Notification preferences saved successfully!");
  };
  
  const handleSaveDisplay = () => {
    alert("Display preferences saved successfully!");
  };
  
  const handleSavePrivacy = () => {
    alert("Privacy settings saved successfully!");
  };
  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="Settings" 
      userRole="parent"
    >
      <div className="space-y-6">
        {/* MSA Islamic Welcome Section */}
        <div className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 rounded-xl p-6 border border-msa-light-sage/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">⚙️</div>
            <div>
              <h2 className="text-2xl font-bold text-msa-charcoal mb-1 font-primary">
                Account Settings
              </h2>
              <p className="text-sm text-msa-sage">
                Manage your preferences and account information
              </p>
            </div>
          </div>
        </div>
        
        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Settings Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="firstName">
                      First Name
                    </label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="lastName">
                      Last Name
                    </label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <Input id="email" defaultValue="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="phone">
                    Phone Number
                  </label>
                  <Input id="phone" defaultValue="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="address">
                    Address
                  </label>
                  <Input id="address" defaultValue="123 Main St, Anytown, US 12345" />
                </div>
                <Button onClick={handleSaveProfile} className="bg-msa-sage hover:bg-msa-forest">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Settings Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-msa-sage" />
                      <div>
                        <h4 className="font-medium text-msa-charcoal">Email Notifications</h4>
                        <p className="text-sm text-msa-sage">Receive emails about events and announcements</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`h-6 w-11 rounded-full cursor-pointer flex items-center transition-colors ${
                        emailNotifications ? 'bg-msa-sage' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${
                        emailNotifications ? 'translate-x-5' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-msa-sage" />
                      <div>
                        <h4 className="font-medium text-msa-charcoal">SMS Notifications</h4>
                        <p className="text-sm text-msa-sage">Receive text messages for urgent updates</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSmsNotifications(!smsNotifications)}
                      className={`h-6 w-11 rounded-full cursor-pointer flex items-center transition-colors ${
                        smsNotifications ? 'bg-msa-sage' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${
                        smsNotifications ? 'translate-x-5' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-msa-charcoal">Event Reminders</h4>
                      <p className="text-sm text-msa-sage">Get notified about upcoming events</p>
                    </div>
                    <button 
                      onClick={() => setEventReminders(!eventReminders)}
                      className={`h-6 w-11 rounded-full cursor-pointer flex items-center transition-colors ${
                        eventReminders ? 'bg-msa-sage' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${
                        eventReminders ? 'translate-x-5' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-msa-charcoal">Achievement Alerts</h4>
                      <p className="text-sm text-msa-sage">Get notified when scouts earn badges</p>
                    </div>
                    <button 
                      onClick={() => setAchievementAlerts(!achievementAlerts)}
                      className={`h-6 w-11 rounded-full cursor-pointer flex items-center transition-colors ${
                        achievementAlerts ? 'bg-msa-sage' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${
                        achievementAlerts ? 'translate-x-5' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-msa-charcoal">Weekly Reports</h4>
                      <p className="text-sm text-msa-sage">Receive weekly activity summaries</p>
                    </div>
                    <button 
                      onClick={() => setWeeklyReports(!weeklyReports)}
                      className={`h-6 w-11 rounded-full cursor-pointer flex items-center transition-colors ${
                        weeklyReports ? 'bg-msa-sage' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${
                        weeklyReports ? 'translate-x-5' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  
                  <Button onClick={handleSavePreferences} className="bg-msa-sage hover:bg-msa-forest">
                    Save Notification Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="newPassword">
                    New Password
                  </label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button onClick={handleUpdatePassword} className="bg-msa-sage hover:bg-msa-forest">
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Settings Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Display & Privacy Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="h-5 w-5 text-msa-sage" />
                    <div>
                      <h4 className="font-medium text-msa-charcoal">Dark Mode</h4>
                      <p className="text-sm text-msa-sage">Switch to dark theme</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`h-6 w-11 rounded-full cursor-pointer flex items-center transition-colors ${
                      darkMode ? 'bg-msa-sage' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${
                      darkMode ? 'translate-x-5' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="language">
                    Language
                  </label>
                  <select 
                    id="language" 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-msa-sage"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-msa-charcoal mb-1" htmlFor="timezone">
                    Timezone
                  </label>
                  <select 
                    id="timezone" 
                    value={timezone} 
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-msa-sage"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                
                <Button onClick={handleSaveDisplay} className="bg-msa-sage hover:bg-msa-forest">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
