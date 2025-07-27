"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Users,
  Calendar,
  MessageSquare,
  Award,
  FileText,
  HelpCircle
} from "lucide-react";
import { MobileButton } from "@/components/ui/MobileButton";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingFlowProps {
  onComplete: () => void;
  userRole?: "parent" | "leader" | "executive";
}

export default function OnboardingFlow({ onComplete, userRole = "parent" }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [scoutsAdded, setScoutsAdded] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Mi'raj Scouts Portal!",
      description: "Let's get you set up in just a few minutes",
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Welcome aboard!</h3>
            <p className="text-gray-600">
              We're excited to have you join our scouting community. This quick tour will help you get started.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">What you'll learn:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <span>How to add and manage your scouts</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <span>RSVP for events and sign permission slips</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Track achievements and progress</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Communicate with leaders</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "add-scouts",
      title: "Add Your Scouts",
      description: "Let's start by adding your scouts to the system",
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Add Your Scouts</h3>
            <p className="text-gray-600">Add each of your children who are part of the scouting program</p>
          </div>

          {!scoutsAdded ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No scouts added yet</p>
                <MobileButton 
                  onClick={() => setScoutsAdded(true)}
                  leftIcon={<Users className="h-5 w-5" />}
                >
                  Add Your First Scout
                </MobileButton>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Scout Added Successfully!</p>
                  <p className="text-sm text-gray-600">You can add more scouts from your dashboard later</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quick Tip
            </h4>
            <p className="text-sm text-gray-600">
              You'll need your scout's group information and member ID. If you don't have these handy, 
              you can add them later from your dashboard.
            </p>
          </div>
        </div>
      ),
      action: scoutsAdded ? undefined : {
        label: "I'll add scouts later",
        onClick: () => setCurrentStep(currentStep + 1)
      }
    },
    {
      id: "events",
      title: "Events & Activities",
      description: "Stay updated with upcoming events",
      icon: Calendar,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Events & Activities</h3>
            <p className="text-gray-600">Never miss an important scouting event</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h4 className="font-medium mb-3">Key Features:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Quick RSVP</p>
                    <p className="text-sm text-gray-600">Respond to events with one tap for all your scouts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Digital Permission Slips</p>
                    <p className="text-sm text-gray-600">Sign permission slips right from your phone</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Calendar Sync</p>
                    <p className="text-sm text-gray-600">Add events to your phone's calendar automatically</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Pro tip:</strong> Enable notifications to get reminders about upcoming events and RSVP deadlines
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "progress",
      title: "Track Progress",
      description: "Monitor achievements and attendance",
      icon: Award,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Award className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress & Achievements</h3>
            <p className="text-gray-600">Celebrate your scout's journey and milestones</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border text-center">
              <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="font-medium">Badges</p>
              <p className="text-sm text-gray-600">Track earned badges</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border text-center">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="font-medium">Attendance</p>
              <p className="text-sm text-gray-600">Monitor participation</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border text-center">
              <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Reports</p>
              <p className="text-sm text-gray-600">Download progress reports</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border text-center">
              <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="font-medium">Feedback</p>
              <p className="text-sm text-gray-600">Leader observations</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Achievement Notifications</h4>
            <p className="text-sm text-gray-600">
              You'll receive notifications when your scout earns new badges or reaches milestones
            </p>
          </div>
        </div>
      )
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Start exploring your dashboard",
      icon: Check,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">You're all set!</h3>
            <p className="text-gray-600">You're ready to start your scouting journey</p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h4 className="font-medium mb-3">Quick Actions to Get Started:</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded text-green-600" defaultChecked={scoutsAdded} />
                <span className="text-sm">Add your scouts to the system</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm">Check upcoming events</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm">Update your notification preferences</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded text-green-600" />
                <span className="text-sm">Read messages from leaders</span>
              </label>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Need help? Visit our <a href="#" className="text-blue-600 underline">Help Center</a> or 
              contact your group leader
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(new Set([...completedSteps, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-700"
        >
          Skip
        </button>
        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentStep
                  ? "w-8 bg-blue-600"
                  : completedSteps.has(index)
                  ? "w-2 bg-green-600"
                  : "w-2 bg-gray-300"
              )}
            />
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8">
          {step.content}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <MobileButton
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            leftIcon={<ChevronLeft className="h-5 w-5" />}
          >
            Back
          </MobileButton>

          <div className="flex items-center gap-3">
            {step.action && (
              <MobileButton
                variant="outline"
                onClick={step.action.onClick}
              >
                {step.action.label}
              </MobileButton>
            )}
            
            <MobileButton
              onClick={handleNext}
              rightIcon={!isLastStep && <ChevronRight className="h-5 w-5" />}
            >
              {isLastStep ? "Get Started" : "Continue"}
            </MobileButton>
          </div>
        </div>
      </div>
    </div>
  );
}