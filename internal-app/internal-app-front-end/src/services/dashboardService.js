import api from './api';

const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),

  getRecentOrders: (limit = 10) =>
    api.get('/dashboard/recent-orders', { params: { limit } }),

  getDailyStats: (date) =>
    api.get('/dashboard/daily-stats', { params: { date } }),

  getWeeklyTrend: () => api.get('/dashboard/weekly-trend'),
};

export default dashboardService;
