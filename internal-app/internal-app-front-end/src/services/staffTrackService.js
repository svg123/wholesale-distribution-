// Staff Track Service - Mock API layer for staff tracking module
// Ready to be replaced with real API calls

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const staffTrackService = {
  // Fetch all employees with their current status
  async fetchEmployees() {
    await delay(300);
    // In real app: return api.get('/staff-track/employees');
    return { success: true };
  },

  // Fetch attendance records for today
  async fetchAttendance() {
    await delay(200);
    return { success: true };
  },

  // Fetch productivity metrics
  async fetchProductivity() {
    await delay(200);
    return { success: true };
  },

  // Fetch activity log for a specific employee
  async fetchActivityLog(employeeId) {
    await delay(200);
    return { success: true, employeeId };
  },

  // Fetch leave records
  async fetchLeaveRecords() {
    await delay(200);
    return { success: true };
  },

  // Fetch performance reviews
  async fetchPerformance() {
    await delay(200);
    return { success: true };
  },

  // Update employee status (Working / Idle / On Leave)
  async updateEmployeeStatus(employeeId, status) {
    await delay(300);
    return { success: true, employeeId, status };
  },

  // Add manager feedback for an employee
  async addFeedback(employeeId, feedback, rating) {
    await delay(300);
    return { success: true, employeeId };
  },

  // Get daily summary report
  async fetchDailySummary() {
    await delay(400);
    return { success: true };
  },
};

export default staffTrackService;
