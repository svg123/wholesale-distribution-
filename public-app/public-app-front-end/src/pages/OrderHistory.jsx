import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  setFilters,
  setPagination,
} from '../redux/slices/orderSlice';
import OrderHistoryTable from '../components/OrderHistory/OrderHistoryTable';
import OrderFilters from '../components/OrderHistory/OrderFilters';
import OrderStats from '../components/OrderHistory/OrderStats';

export default function OrderHistoryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { orders, isLoading, filters, pagination } = useSelector((state) => state.order);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch orders on component mount or when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchMockOrders();
    }
  }, [filters, pagination.page, isAuthenticated]);

  const fetchMockOrders = async () => {
    dispatch(fetchOrdersStart());
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock orders data with various statuses
    const mockOrders = [
      {
        id: 'ORD-20260318-0001',
        date: '2026-03-18',
        items: 5,
        products: ['Telmikind', 'Aspirin Plus', 'Amoxicillin'],
        total: 6435,
        status: 'DELIVERED',
        pharmacist: 'PHARM001',
      },
      {
        id: 'ORD-20260317-0002',
        date: '2026-03-17',
        items: 3,
        products: ['Vitamin D3', 'Metformin'],
        total: 4200,
        status: 'SHIPPED',
        pharmacist: 'PHARM001',
      },
      {
        id: 'ORD-20260316-0003',
        date: '2026-03-16',
        items: 8,
        products: ['Omeprazole', 'Telmikind', 'Vitamin D3'],
        total: 8900,
        status: 'CONFIRMED',
        pharmacist: 'PHARM001',
      },
      {
        id: 'ORD-20260315-0004',
        date: '2026-03-15',
        items: 2,
        products: ['Aspirin Plus', 'Metformin'],
        total: 2850,
        status: 'PENDING',
        pharmacist: 'PHARM001',
      },
      {
        id: 'ORD-20260314-0005',
        date: '2026-03-14',
        items: 6,
        products: ['Amoxicillin', 'Omeprazole', 'Telmikind'],
        total: 5600,
        status: 'DELIVERED',
        pharmacist: 'PHARM001',
      },
      {
        id: 'ORD-20260313-0006',
        date: '2026-03-13',
        items: 4,
        products: ['Vitamin D3', 'Aspirin Plus'],
        total: 3400,
        status: 'CANCELLED',
        pharmacist: 'PHARM001',
      },
      {
        id: 'ORD-20260312-0007',
        date: '2026-03-12',
        items: 7,
        products: ['Metformin', 'Telmikind', 'Amoxicillin'],
        total: 7200,
        status: 'DELIVERED',
        pharmacist: 'PHARM001',
      },
      {
        id: 'ORD-20260311-0008',
        date: '2026-03-11',
        items: 3,
        products: ['Omeprazole'],
        total: 2100,
        status: 'SHIPPED',
        pharmacist: 'PHARM001',
      },
    ];

    // Filter by status if selected
    let filtered = mockOrders;
    if (filters.status !== 'all') {
      filtered = mockOrders.filter((order) => order.status === filters.status);
    }

    // Filter by date range if provided
    if (filters.dateFrom) {
      filtered = filtered.filter((order) => new Date(order.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter((order) => new Date(order.date) <= new Date(filters.dateTo));
    }

    // Calculate pagination
    const total = filtered.length;
    const limit = pagination.limit;
    const start = (pagination.page - 1) * limit;
    const paginatedOrders = filtered.slice(start, start + limit);

    dispatch(
      fetchOrdersSuccess({
        orders: paginatedOrders,
        total,
      })
    );
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (page) => {
    dispatch(setPagination({ page }));
  };

  const handleViewOrder = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  const handleModifyOrder = (orderId) => {
    navigate(`/modify-order/${orderId}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
              <p className="text-gray-600 mt-1">View and manage your pharmaceutical orders</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Stats Cards */}
        <OrderStats orders={orders} />

        {/* Filters Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>
          <OrderFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        </div>

        {/* Orders Table */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Orders</h2>
          <OrderHistoryTable
            orders={orders}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onViewOrder={handleViewOrder}
            onModifyOrder={handleModifyOrder}
          />
        </div>
      </main>
    </div>
  );
}
