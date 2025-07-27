"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DateTimeDisplay from "@/components/ui/DateTimeDisplay";

interface PaymentRecord {
  id: string;
  studentName: string;
  parentName: string;
  amount: number;
  type: 'membership' | 'event' | 'equipment' | 'donation';
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  academy: string;
  description: string;
  method?: 'card' | 'bank' | 'cash';
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  studentName: string;
  parentEmail: string;
  amount: number;
  items: InvoiceItem[];
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  academy: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentManagementProps {
  className?: string;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ className = "" }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'payments' | 'invoices' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [showProcessPayment, setShowProcessPayment] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  // Mock payment records
  const paymentRecords: PaymentRecord[] = [
    {
      id: '1',
      studentName: 'Ahmad Ali',
      parentName: 'Mohamed Ali',
      amount: 75,
      type: 'membership',
      status: 'paid',
      dueDate: '2025-01-15',
      paidDate: '2025-01-10',
      academy: 'Main Academy',
      description: 'Monthly membership fee - January',
      method: 'card'
    },
    {
      id: '2',
      studentName: 'Fatima Hassan',
      parentName: 'Omar Hassan',
      amount: 25,
      type: 'event',
      status: 'pending',
      dueDate: '2025-01-20',
      academy: 'North Branch',
      description: 'Winter camping event registration'
    },
    {
      id: '3',
      studentName: 'Omar Ahmed',
      parentName: 'Ahmed Mohamed',
      amount: 50,
      type: 'equipment',
      status: 'overdue',
      dueDate: '2025-01-05',
      academy: 'South Branch',
      description: 'Scout uniform and equipment'
    },
    {
      id: '4',
      studentName: 'Aisha Khan',
      parentName: 'Rashid Khan',
      amount: 100,
      type: 'donation',
      status: 'paid',
      dueDate: '2025-01-12',
      paidDate: '2025-01-08',
      academy: 'Main Academy',
      description: 'Zakat donation for underprivileged scouts',
      method: 'bank'
    }
  ];

  // Mock invoice records
  const invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2025-001',
      studentName: 'Ahmad Ali',
      parentEmail: 'mohamed.ali@email.com',
      amount: 125,
      items: [
        { description: 'Monthly membership fee', quantity: 1, unitPrice: 75, total: 75 },
        { description: 'Activity materials', quantity: 1, unitPrice: 50, total: 50 }
      ],
      issueDate: '2025-01-01',
      dueDate: '2025-01-15',
      status: 'paid',
      academy: 'Main Academy'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-002',
      studentName: 'Fatima Hassan',
      parentEmail: 'omar.hassan@email.com',
      amount: 100,
      items: [
        { description: 'Monthly membership fee', quantity: 1, unitPrice: 75, total: 75 },
        { description: 'Event registration', quantity: 1, unitPrice: 25, total: 25 }
      ],
      issueDate: '2025-01-05',
      dueDate: '2025-01-20',
      status: 'sent',
      academy: 'North Branch'
    }
  ];

  // Filter payments based on search and filters
  const filteredPayments = paymentRecords.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesAcademy = selectedAcademy === 'all' || payment.academy === selectedAcademy;
    
    return matchesSearch && matchesStatus && matchesAcademy;
  });

  // Payment statistics
  const paymentStats = {
    totalRevenue: paymentRecords.reduce((sum, payment) => sum + payment.amount, 0),
    paidAmount: paymentRecords.filter(p => p.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0),
    pendingAmount: paymentRecords.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0),
    overdueAmount: paymentRecords.filter(p => p.status === 'overdue').reduce((sum, payment) => sum + payment.amount, 0),
    totalPayments: paymentRecords.length,
    paidPayments: paymentRecords.filter(p => p.status === 'paid').length,
    pendingPayments: paymentRecords.filter(p => p.status === 'pending').length,
    overduePayments: paymentRecords.filter(p => p.status === 'overdue').length
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment type icon
  const getPaymentTypeIcon = (type: string): string => {
    switch (type) {
      case 'membership':
        return '👥';
      case 'event':
        return '🎪';
      case 'equipment':
        return '🎒';
      case 'donation':
        return '🤲';
      default:
        return '💳';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-msa-charcoal">Payment Management</h2>
          <p className="text-msa-sage/70">Process payments, manage invoices, and track financial transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowProcessPayment(true)}
            className="bg-msa-sage hover:bg-msa-sage/90 text-white"
          >
            Process Payment
          </Button>
          <Button
            onClick={() => setShowCreateInvoice(true)}
            className="bg-msa-golden hover:bg-msa-golden/90 text-white"
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Payment Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-msa-sage">{formatCurrency(paymentStats.totalRevenue)}</div>
            <p className="text-xs text-msa-sage/70">{paymentStats.totalPayments} total payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paymentStats.paidAmount)}</div>
            <p className="text-xs text-msa-sage/70">{paymentStats.paidPayments} payments collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(paymentStats.pendingAmount)}</div>
            <p className="text-xs text-msa-sage/70">{paymentStats.pendingPayments} pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(paymentStats.overdueAmount)}</div>
            <p className="text-xs text-msa-sage/70">{paymentStats.overduePayments} overdue payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            selectedTab === 'overview' 
              ? 'border-b-2 border-msa-sage text-msa-sage' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            selectedTab === 'payments' 
              ? 'border-b-2 border-msa-sage text-msa-sage' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('payments')}
        >
          Payments
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            selectedTab === 'invoices' 
              ? 'border-b-2 border-msa-sage text-msa-sage' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('invoices')}
        >
          Invoices
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            selectedTab === 'reports' 
              ? 'border-b-2 border-msa-sage text-msa-sage' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('reports')}
        >
          Reports
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-msa-sage hover:bg-msa-sage/90 text-white justify-start">
                <span className="mr-2">💳</span>
                Process Outstanding Payments
              </Button>
              <Button className="w-full bg-msa-golden hover:bg-msa-golden/90 text-white justify-start">
                <span className="mr-2">📄</span>
                Generate Monthly Invoices
              </Button>
              <Button className="w-full bg-msa-teal hover:bg-msa-teal/90 text-white justify-start">
                <span className="mr-2">📧</span>
                Send Payment Reminders
              </Button>
              <Button className="w-full border border-msa-sage text-msa-sage hover:bg-msa-sage/10 justify-start">
                <span className="mr-2">📊</span>
                Export Payment Report
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentRecords.slice(0, 4).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 hover:bg-msa-sage/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getPaymentTypeIcon(payment.type)}</span>
                      <div>
                        <div className="font-medium text-sm">{payment.studentName}</div>
                        <div className="text-xs text-gray-500">{payment.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(payment.amount)}</div>
                      <div className={`text-xs px-2 py-1 rounded ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'payments' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
                <select
                  value={selectedAcademy}
                  onChange={(e) => setSelectedAcademy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                >
                  <option value="all">All Academies</option>
                  <option value="Main Academy">Main Academy</option>
                  <option value="North Branch">North Branch</option>
                  <option value="South Branch">South Branch</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Payment Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Due Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Academy</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium">{payment.studentName}</div>
                          <div className="text-sm text-gray-500">{payment.parentName}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span>{getPaymentTypeIcon(payment.type)}</span>
                            <span className="capitalize">{payment.type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold">{formatCurrency(payment.amount)}</td>
                        <td className="py-4 px-4">
                          <DateTimeDisplay date={payment.dueDate} format="MMM dd, yyyy" />
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">{payment.academy}</td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">View</Button>
                            {payment.status !== 'paid' && (
                              <Button variant="outline" size="sm" className="text-green-600">
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'invoices' && (
        <div className="space-y-4">
          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Invoice Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Invoice #</th>
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Issue Date</th>
                      <th className="text-left py-3 px-4">Due Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{invoice.invoiceNumber}</td>
                        <td className="py-4 px-4">
                          <div className="font-medium">{invoice.studentName}</div>
                          <div className="text-sm text-gray-500">{invoice.parentEmail}</div>
                        </td>
                        <td className="py-4 px-4 font-bold">{formatCurrency(invoice.amount)}</td>
                        <td className="py-4 px-4">
                          <DateTimeDisplay date={invoice.issueDate} format="MMM dd, yyyy" />
                        </td>
                        <td className="py-4 px-4">
                          <DateTimeDisplay date={invoice.dueDate} format="MMM dd, yyyy" />
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Send</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:bg-msa-sage/5 cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold text-msa-charcoal">Payment Summary</h3>
              <p className="text-sm text-msa-sage/70 mt-2">Monthly payment collection summary</p>
            </div>
          </Card>
          
          <Card className="p-6 hover:bg-msa-sage/5 cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="font-semibold text-msa-charcoal">Revenue Analysis</h3>
              <p className="text-sm text-msa-sage/70 mt-2">Revenue trends and forecasting</p>
            </div>
          </Card>
          
          <Card className="p-6 hover:bg-msa-sage/5 cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl mb-4">⚠️</div>
              <h3 className="font-semibold text-msa-charcoal">Overdue Report</h3>
              <p className="text-sm text-msa-sage/70 mt-2">Outstanding and overdue payments</p>
            </div>
          </Card>
        </div>
      )}

      {/* Islamic Values Message */}
      <Card className="bg-gradient-to-r from-msa-sage/5 to-msa-golden/5 border-msa-sage/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤲</div>
            <div>
              <h3 className="text-lg font-semibold text-msa-charcoal">Amanah in Financial Management</h3>
              <p className="text-sm text-msa-sage/80 mt-1">
                "O you who believe! Fulfil your obligations." - Quran 5:1
              </p>
              <p className="text-xs text-msa-sage/70 mt-2">
                We manage payments with complete transparency and trust, ensuring every transaction serves our Islamic community's growth and development.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentManagement;