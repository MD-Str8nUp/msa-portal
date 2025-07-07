"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { executiveNavigation } from "@/components/navigation/ExecutiveNavigation";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import FinancialDashboard from "@/components/executive/FinancialDashboard";
import PaymentManagement from "@/components/executive/PaymentManagement";

export default function ExecutiveFinancePage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <DashboardLayout 
      navigation={executiveNavigation} 
      pageTitle="Financial Dashboard" 
      userRole="executive"
    >
      <div className="space-y-6">
        {/* Islamic Welcome Section */}
        <div className="bg-gradient-to-r from-msa-sage/10 via-msa-golden/10 to-msa-light-sage/20 rounded-xl p-6 border border-msa-light-sage/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">💰</div>
            <div>
              <h2 className="text-2xl font-bold text-msa-charcoal mb-1 font-primary">
                Financial Stewardship Dashboard
              </h2>
            </div>
          </div>
          <p className="text-msa-charcoal/80 text-lg font-secondary">
            Managing Mi'raj Scouts Academy finances with Islamic principles of trust and accountability
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-msa-sage">
              "And give full measure when you measure, and weigh with a balance that is straight" - Quran 17:35
            </span>
          </div>
        </div>

        {/* Financial Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Financial Dashboard</TabsTrigger>
            <TabsTrigger value="payments">Payment Management</TabsTrigger>
          </TabsList>
          
          {/* Financial Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <FinancialDashboard />
          </TabsContent>
          
          {/* Payment Management Tab */}
          <TabsContent value="payments" className="mt-6">
            <PaymentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}