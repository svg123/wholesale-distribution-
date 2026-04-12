/**
 * Mock API service for the Communication module.
 * Replace these functions with real API calls when the backend is ready.
 */

// ── Mock server messages (admin → user) ──
const mockServerMessages = [
  {
    id: 'MSG-001',
    title: 'Scheduled Maintenance Notice',
    content:
      'Dear Pharmacist, our system will undergo scheduled maintenance on April 2, 2026 from 2:00 AM to 6:00 AM IST. During this window, order placement and tracking will be temporarily unavailable. Please plan your orders accordingly. We apologize for any inconvenience.',
    date: '2026-03-28T09:30:00',
    isRead: false,
    priority: 'high',
    from: 'System Admin',
  },
  {
    id: 'MSG-002',
    title: 'New Scheme Launch — Summer Bonanza',
    content:
      'Exciting news! Starting April 1, 2026, enjoy flat 25% extra free units on all antibiotic and vitamin categories. This limited-time offer is valid until April 30, 2026. Stock up now and save more on your wholesale orders!',
    date: '2026-03-27T14:15:00',
    isRead: false,
    priority: 'medium',
    from: 'Marketing Team',
  },
  {
    id: 'MSG-003',
    title: 'Payment Reminder — Invoice INV-2026-001',
    content:
      'This is a gentle reminder that your payment of ₹30,000 for Invoice INV-2026-001 is overdue since March 10, 2026. Please process the payment at your earliest convenience to avoid any service disruption. Contact our accounts team for any queries.',
    date: '2026-03-26T11:00:00',
    isRead: true,
    priority: 'high',
    from: 'Accounts Department',
  },
  {
    id: 'MSG-004',
    title: 'GST Rate Update',
    content:
      'Please note: Effective April 1, 2026, GST rates on certain pharmaceutical categories have been revised as per government notification. Updated rates will be reflected in your invoices automatically. For details, visit your profile section or contact support.',
    date: '2026-03-25T08:45:00',
    isRead: true,
    priority: 'low',
    from: 'Compliance Team',
  },
  {
    id: 'MSG-005',
    title: 'Welcome to Pharma Wholesale Portal',
    content:
      'Welcome aboard! We are thrilled to have you on our platform. You can now browse products, place orders, track deliveries, and manage payments — all in one place. If you need any assistance, use the Help & Support section. Happy ordering!',
    date: '2026-03-20T10:00:00',
    isRead: true,
    priority: 'low',
    from: 'System Admin',
  },
  {
    id: 'MSG-006',
    title: 'Order Delivery Delay — Weather Advisory',
    content:
      'Due to severe weather conditions in certain regions, deliveries may experience delays of 1–2 business days. Our logistics team is working to minimize disruptions. You can track your order status in real-time from the Track Order section.',
    date: '2026-03-22T16:30:00',
    isRead: false,
    priority: 'medium',
    from: 'Logistics Team',
  },
];

// ── Mock assistance request history ──
const mockRequestHistory = [
  {
    id: 'REQ-001',
    subject: 'Unable to add product to cart',
    message: 'When I try to add Metformin 500mg to my cart, it shows an error after clicking the Add button. I have tried multiple times.',
    status: 'resolved',
    date: '2026-03-25T10:20:00',
  },
  {
    id: 'REQ-002',
    subject: 'Wrong GST calculation on invoice',
    message: 'The GST amount on my last invoice INV-2026-003 seems incorrect. The 12% GST is being calculated on the discounted price instead of the base price.',
    status: 'in-progress',
    date: '2026-03-26T14:45:00',
  },
  {
    id: 'REQ-003',
    subject: 'Product availability query',
    message: 'Is Cetirizine 10mg (MED004) available in 200-strip packs? I need a bulk order for my pharmacy chain.',
    status: 'open',
    date: '2026-03-27T09:10:00',
  },
];

/**
 * Fetch server messages.
 */
export const fetchMessages = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [...mockServerMessages].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
};

/**
 * Submit an assistance request.
 */
export const submitAssistanceRequest = async ({ subject, message }) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Validate
  if (!message || message.trim().length === 0) {
    throw new Error('Please enter a message before submitting.');
  }

  // Simulate success
  const newRequest = {
    id: `REQ-${String(Date.now()).slice(-6)}`,
    subject: subject?.trim() || 'General Inquiry',
    message: message.trim(),
    status: 'open',
    date: new Date().toISOString(),
  };

  return newRequest;
};

/**
 * Fetch previous assistance request history.
 */
export const fetchRequestHistory = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [...mockRequestHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
};
