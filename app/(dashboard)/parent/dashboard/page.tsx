"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { parentNavigation } from "@/components/navigation/ParentNavigation";
import { mockScoutService, mockEventService } from "@/lib/mock/data";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";
import { Button } from "@/components/ui/Button";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users, 
  Award, 
  Clock,
  ChevronRight,
  Bell,
  Heart,
  CheckCircle
} from "lucide-react";

export default function ParentDashboard() {
  // In a real app, this would come from auth context/session
  const parentId = "user-1";
  
  // Get parent's scouts
  const myScouts = mockScoutService.getScouts(parentId);
  
  // Get upcoming events
  const events = mockEventService.getEvents();
  const upcomingEvents = events.filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  // Mock data for demonstration
  const pendingPermissionSlips = 2;
  const unreadMessages = 3;
  const nextEvent = upcomingEvents[0];
  const volunteerOpportunities = 1;

  return (
    <DashboardLayout 
      navigation={parentNavigation} 
      pageTitle="Dashboard" 
      userRole="parent"
    >
      <div className="space-y-6 pb-6">
        {/* MSA Islamic Welcome Section - Mobile Optimized */}
        <div className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 rounded-xl p-6 border border-msa-light-sage/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🌙</div>
            <div>
              <h1 className="text-2xl font-bold text-msa-charcoal mb-1 font-primary">
                Assalamu Alaikum!
              </h1>
              <p className="text-sm text-msa-sage">
                Peace and blessings upon you
              </p>
            </div>
          </div>
          <p className="text-msa-charcoal/80 text-lg font-secondary">
            Welcome to Mi'raj Scouts Academy. Here's what's happening with your scouts today.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-msa-golden" />
            <span className="text-sm text-msa-sage">
              May Allah bless your family
            </span>
          </div>
        </div>

        {/* Priority Actions - Mobile First */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          
          {/* High Priority Items */}
          {pendingPermissionSlips > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-warning/20 rounded-lg">
                      <FileText className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Permission Slips Needed</h3>
                      <p className="text-sm text-muted-foreground">{pendingPermissionSlips} events need your approval</p>
                    </div>
                  </div>
                  <Button size="sm" className="touch-target">
                    Sign Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Action Grid */}
          <div className="mobile-grid">
            {/* Messages */}
            <Card className="quick-action-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Messages</h3>
                      {unreadMessages > 0 && (
                        <div className="flex items-center space-x-1">
                          <div className="h-2 w-2 bg-warning rounded-full"></div>
                          <span className="text-sm text-warning">{unreadMessages} new</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Events */}
            <Card className="quick-action-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Events</h3>
                      <p className="text-sm text-muted-foreground">{upcomingEvents.length} upcoming</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Volunteer */}
            <Card className="quick-action-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-success/20 rounded-lg">
                      <Heart className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Volunteer</h3>
                      <p className="text-sm text-muted-foreground">{volunteerOpportunities} opportunity</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Event Spotlight */}
        {nextEvent && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Next Event</h2>
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">{nextEvent.title}</h3>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          <DateTimeDisplay date={nextEvent.startDate} format="EEEE, MMM d" />
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="touch-target">
                      View Details
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{nextEvent.description}</p>
                  <Button className="w-full touch-target-comfortable">
                    RSVP for My Scouts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Scouts - Simplified for Mobile */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">My Scouts</h2>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {myScouts.map((scout) => (
              <Card key={scout.id} className="quick-action-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {scout.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{scout.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{scout.groupName}</span>
                          <span>•</span>
                          <span>{scout.rank}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">3</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-success/5 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
              <div className="flex-1">
                <p className="text-sm font-medium">Badge earned: Outdoor Challenge</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg">
              <Bell className="h-5 w-5 text-accent-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Event reminder: Weekend Camp</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
