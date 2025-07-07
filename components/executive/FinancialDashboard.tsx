"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface FinancialMetric {
  title: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon: string;
  color: string;
}

interface AcademyData {
  id: string;
  name: string;
  revenue: number;
  students: number;
  paymentRate: number;
  outstandingAmount: number;
  monthlyGrowth: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  membershipFees: number;
  eventRevenue: number;
  donations: number;
}

interface FinancialDashboardProps {
  className?: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ className = "" }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');

  // Mock financial metrics data
  const financialMetrics: FinancialMetric[] = [
    {
      title: 'Total Revenue',
      value: 145000,
      format: 'currency',
      trend: 'up',
      trendValue: 12.5,
      icon: '💰',
      color: 'msa-sage'
    },
    {
      title: 'Monthly Revenue',
      value: 12500,
      format: 'currency',
      trend: 'up',
      trendValue: 8.3,
      icon: '📈',
      color: 'msa-golden'
    },
    {
      title: 'Payment Rate',
      value: 94.1,
      format: 'percentage',
      trend: 'stable',
      trendValue: 0.5,
      icon: '✅',
      color: 'green-600'
    },
    {
      title: 'Outstanding',
      value: 8500,
      format: 'currency',
      trend: 'down',
      trendValue: 15.2,
      icon: '⏳',
      color: 'orange-600'
    }
  ];

  // Mock academy performance data
  const academyData: AcademyData[] = [
    {
      id: 'main',
      name: 'Main Academy',
      revenue: 65000,
      students: 120,
      paymentRate: 96.5,
      outstandingAmount: 2500,
      monthlyGrowth: 8.2
    },
    {
      id: 'north',
      name: 'North Branch',
      revenue: 45000,
      students: 85,
      paymentRate: 92.3,
      outstandingAmount: 3500,
      monthlyGrowth: 12.1
    },
    {
      id: 'south',
      name: 'South Branch',
      revenue: 35000,
      students: 70,
      paymentRate: 93.8,
      outstandingAmount: 2500,
      monthlyGrowth: 5.7
    }
  ];

  // Mock monthly data
  const monthlyData: MonthlyData[] = [
    {
      month: 'Jan',
      revenue: 11000,
      expenses: 8500,
      profit: 2500,
      membershipFees: 7500,
      eventRevenue: 2000,
      donations: 1500
    },
    {
      month: 'Feb',
      revenue: 12000,
      expenses: 9000,
      profit: 3000,
      membershipFees: 8000,
      eventRevenue: 2500,
      donations: 1500
    },
    {
      month: 'Mar',
      revenue: 13500,
      expenses: 9500,
      profit: 4000,
      membershipFees: 9000,
      eventRevenue: 3000,
      donations: 1500
    },
    {
      month: 'Apr',
      revenue: 12800,
      expenses: 9200,
      profit: 3600,
      membershipFees: 8500,
      eventRevenue: 2800,
      donations: 1500
    },
    {
      month: 'May',
      revenue: 13200,
      expenses: 9800,
      profit: 3400,
      membershipFees: 8800,
      eventRevenue: 2900,
      donations: 1500
    },
    {
      month: 'Jun',
      revenue: 12500,
      expenses: 9100,
      profit: 3400,
      membershipFees: 8000,
      eventRevenue: 3000,
      donations: 1500
    }
  ];

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Format number
  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  // Get formatted value based on format type
  const getFormattedValue = (value: number, format: 'currency' | 'percentage' | 'number'): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  };

  // Get trend color
  const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period Selection */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-msa-charcoal">Financial Overview</h2>
          <p className="text-msa-sage/70">Real-time financial metrics and performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('monthly')}
            className="text-sm"
          >
            Monthly
          </Button>
          <Button
            variant={selectedPeriod === 'quarterly' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('quarterly')}
            className="text-sm"
          >
            Quarterly
          </Button>
          <Button
            variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('yearly')}
            className="text-sm"
          >
            Yearly
          </Button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialMetrics.map((metric, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <span className="text-lg">{metric.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`text-2xl lg:text-3xl font-bold text-${metric.color}`}>
                  {getFormattedValue(metric.value, metric.format)}
                </div>
                {metric.trend && metric.trendValue && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{getTrendIcon(metric.trend)}</span>
                    <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                      {metric.trendValue}% vs last {selectedPeriod.slice(0, -2)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Trends</CardTitle>
            <p className="text-sm text-msa-sage/70">Monthly revenue and profit analysis</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-2">
              {monthlyData.map((item, index) => (
                <div key={item.month} className="flex flex-col items-center flex-1">
                  <div className="w-full space-y-1 flex flex-col items-end">
                    <div className="w-full relative">
                      <div 
                        className="w-full bg-msa-sage rounded-t transition-all duration-300 hover:bg-msa-sage/80" 
                        style={{ height: `${(item.revenue / 15000) * 200}px` }}
                        title={`Revenue: ${formatCurrency(item.revenue)}`}
                      ></div>
                      <div 
                        className="w-full bg-msa-golden rounded-t absolute bottom-0" 
                        style={{ height: `${(item.profit / 15000) * 200}px` }}
                        title={`Profit: ${formatCurrency(item.profit)}`}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs mt-2 text-msa-charcoal font-medium">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-msa-sage rounded"></div>
                <span className="text-sm">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-msa-golden rounded"></div>
                <span className="text-sm">Profit</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academy Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Academy Performance</CardTitle>
            <p className="text-sm text-msa-sage/70">Revenue and growth by academy</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {academyData.map((academy, index) => (
                <div key={academy.id} className="p-4 bg-msa-sage/5 rounded-lg hover:bg-msa-sage/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-msa-charcoal">{academy.name}</h4>
                      <p className="text-sm text-msa-sage/70">{academy.students} scouts</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-msa-charcoal">
                        {formatCurrency(academy.revenue)}
                      </div>
                      <div className="text-sm text-green-600">
                        {formatPercentage(academy.paymentRate)} paid
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-orange-600">
                      Outstanding: {formatCurrency(academy.outstandingAmount)}
                    </span>
                    <span className="text-xs text-green-600">
                      ↗️ {formatPercentage(academy.monthlyGrowth)} growth
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Financial Quick Actions</CardTitle>
          <p className="text-sm text-msa-sage/70">Common financial management tasks</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center gap-2 bg-msa-sage hover:bg-msa-sage/90 text-white">
              <span className="text-lg">💳</span>
              <span className="text-sm">Process Payments</span>
            </Button>
            <Button className="h-20 flex flex-col items-center gap-2 bg-msa-golden hover:bg-msa-golden/90 text-white">
              <span className="text-lg">📄</span>
              <span className="text-sm">Generate Invoices</span>
            </Button>
            <Button className="h-20 flex flex-col items-center gap-2 bg-msa-teal hover:bg-msa-teal/90 text-white">
              <span className="text-lg">📊</span>
              <span className="text-sm">Financial Report</span>
            </Button>
            <Button className="h-20 flex flex-col items-center gap-2 border border-msa-sage text-msa-sage hover:bg-msa-sage/10">
              <span className="text-lg">📧</span>
              <span className="text-sm">Send Reminders</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Islamic Financial Principle */}
      <Card className="bg-gradient-to-r from-msa-sage/5 to-msa-golden/5 border-msa-sage/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🕌</div>
            <div>
              <h3 className="text-lg font-semibold text-msa-charcoal">Islamic Financial Stewardship</h3>
              <p className="text-sm text-msa-sage/80 mt-1">
                "And give full measure when you measure, and weigh with a balance that is straight. That is good and better in the end." - Quran 17:35
              </p>
              <p className="text-xs text-msa-sage/70 mt-2">
                Managing our academy's finances with transparency, accountability, and trust according to Islamic principles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;