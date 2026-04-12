import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OutstandingBalance from '../components/Outstanding/OutstandingBalance';
import OutstandingList from '../components/Outstanding/OutstandingList';
import OutstandingSummary from '../components/Outstanding/OutstandingSummary';
import PaymentHistory from '../components/Outstanding/PaymentHistory';

export default function OutstandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('outstanding');
  const [filters, setFilters] = useState({
    status: 'all',
    days: 'all',
    sortBy: 'dueDate',
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Mock outstanding data
  const outstandingData = [
    {
      id: 'INV-001',
      orderDate: '2026-02-10',
      dueDate: '2026-03-10',
      invoiceNumber: 'INV-2026-001',
      amount: 45000,
      paid: 15000,
      outstanding: 30000,
      status: 'overdue',
      days: 35,
      items: 12,
      notes: 'Pending payment',
    },
    {
      id: 'INV-002',
      orderDate: '2026-02-20',
      dueDate: '2026-03-20',
      invoiceNumber: 'INV-2026-002',
      amount: 28500,
      paid: 0,
      outstanding: 28500,
      status: 'overdue',
      days: 25,
      items: 8,
      notes: 'Not yet paid',
    },
    {
      id: 'INV-003',
      orderDate: '2026-02-25',
      dueDate: '2026-03-25',
      invoiceNumber: 'INV-2026-003',
      amount: 62000,
      paid: 31000,
      outstanding: 31000,
      status: 'pending',
      days: 20,
      items: 15,
      notes: 'Partial payment received',
    },
    {
      id: 'INV-004',
      orderDate: '2026-03-01',
      dueDate: '2026-03-31',
      invoiceNumber: 'INV-2026-004',
      amount: 35800,
      paid: 0,
      outstanding: 35800,
      status: 'pending',
      days: 18,
      items: 10,
      notes: 'Credit terms approved',
    },
    {
      id: 'INV-005',
      orderDate: '2026-03-05',
      dueDate: '2026-04-05',
      invoiceNumber: 'INV-2026-005',
      amount: 51200,
      paid: 0,
      outstanding: 51200,
      status: 'pending',
      days: 14,
      items: 13,
      notes: 'New order',
    },
    {
      id: 'INV-006',
      orderDate: '2026-01-15',
      dueDate: '2026-02-15',
      invoiceNumber: 'INV-2026-006',
      amount: 73500,
      paid: 73500,
      outstanding: 0,
      status: 'paid',
      days: 62,
      items: 18,
      notes: 'Fully paid on 2026-02-14',
    },
  ];

  // Mock payment history
  const paymentHistory = [
    {
      id: 'PAY-001',
      invoiceNumber: 'INV-2026-001',
      paymentDate: '2026-03-05',
      amount: 15000,
      method: 'Bank Transfer',
      reference: 'BANK-2026-001',
      status: 'completed',
    },
    {
      id: 'PAY-002',
      invoiceNumber: 'INV-2026-003',
      paymentDate: '2026-03-08',
      amount: 31000,
      method: 'Cheque',
      reference: 'CHQ-2026-001',
      status: 'completed',
    },
    {
      id: 'PAY-003',
      invoiceNumber: 'INV-2026-006',
      paymentDate: '2026-02-14',
      amount: 73500,
      method: 'NEFT',
      reference: 'NEFT-2026-001',
      status: 'completed',
    },
  ];

  // Filter outstanding data based on selected filters
  const filteredOutstanding = useMemo(() => {
    let filtered = [...outstandingData];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Filter by days (overdue/due)
    if (filters.days === 'overdue') {
      filtered = filtered.filter((item) => item.status === 'overdue');
    } else if (filters.days === 'due-soon') {
      filtered = filtered.filter((item) => item.days <= 7 && item.days > 0 && item.status !== 'overdue');
    }

    // Sort data
    if (filters.sortBy === 'amount') {
      filtered.sort((a, b) => b.outstanding - a.outstanding);
    } else if (filters.sortBy === 'dueDate') {
      filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (filters.sortBy === 'days') {
      filtered.sort((a, b) => b.days - a.days);
    }

    return filtered;
  }, [filters]);

  // Calculate summary data
  const summary = useMemo(() => {
    return {
      totalOutstanding: outstandingData.reduce((sum, item) => sum + item.outstanding, 0),
      totalAmount: outstandingData.reduce((sum, item) => sum + item.amount, 0),
      totalPaid: outstandingData.reduce((sum, item) => sum + item.paid, 0),
      overdueCount: outstandingData.filter((item) => item.status === 'overdue').length,
      overdueAmount: outstandingData
        .filter((item) => item.status === 'overdue')
        .reduce((sum, item) => sum + item.outstanding, 0),
      pendingCount: outstandingData.filter((item) => item.status === 'pending').length,
      pendingAmount: outstandingData
        .filter((item) => item.status === 'pending')
        .reduce((sum, item) => sum + item.outstanding, 0),
      paidCount: outstandingData.filter((item) => item.status === 'paid').length,
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Outstanding & Credits</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your payments and credit outstanding</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Summary Cards */}
        <OutstandingSummary summary={summary} />

        {/* Tabs */}
        <div className="mt-6 bg-white border-b border-gray-200 rounded-t-lg">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('outstanding')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'outstanding'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Outstanding Invoices
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Payment History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'outstanding' && (
          <div className="bg-white rounded-b-lg shadow">
            <OutstandingList
              data={filteredOutstanding}
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-b-lg shadow">
            <PaymentHistory data={paymentHistory} />
          </div>
        )}
      </main>
    </div>
  );
}
