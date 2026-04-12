/**
 * Bill Service — Mock API for generating sales order bills / invoices
 * --------------------------------------------------------------------
 * Each product gets a mock unit-price.  The service builds line-items
 * from the processed batches, computes sub-totals, applies discounts,
 * adds GST (CGST + SGST), and returns a complete bill object.
 */

// ── Mock Unit Prices (₹ per unit) ────────────────────────────────
const UNIT_PRICES = {
  P1: 2.5,    // Paracetamol 500mg
  P2: 8.75,   // Amoxicillin 250mg
  P3: 4.2,    // Ibuprofen 400mg
  P4: 3.1,    // Metformin 500mg
  P5: 6.5,    // Omeprazole 20mg
  P6: 1.8,    // Cetirizine 10mg
  P7: 5.25,   // Vitamin D3 1000IU
  P8: 2.1,    // Calcium Carbonate 500mg
  P9: 22.0,   // Azithromycin 500mg
  P10: 7.8,   // Pantoprazole 40mg
  P11: 3.5,   // Diclofenac 50mg
  P12: 9.2,   // Losartan 50mg
  P13: 1.6,   // Dolo 650mg
  P14: 11.5,  // Montelukast 10mg
};

// ── Default pricing for unknown products ─────────────────────────
const DEFAULT_UNIT_PRICE = 5.0;

// ── GST Rate (can be made configurable later) ────────────────────
const GST_RATE = 0.12; // 12% — common for pharma

// ── Counter for bill numbers ─────────────────────────────────────
let billCounter = 1000;

const billService = {
  /**
   * Generate a final bill for a processed sales order.
   *
   * @param {Object} params
   * @param {string}  params.orderId       — Order number (e.g. ORD-001)
   * @param {string}  params.customer      — Customer name
   * @param {string}  params.substation    — Sub-station name (e.g. ABBOTT)
   * @param {string}  params.substationId  — Sub-station ID (e.g. STN-ABBOTT)
   * @param {Array}   params.products      — Processed products with batches
   * @param {number}  [params.discountPercent=0] — Discount percentage (0-100)
   *
   * @returns {Promise<Object>} Complete bill object
   */
  generateBill: ({
    orderId,
    customer,
    substation,
    substationId,
    products,
    discountPercent = 0,
  }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!orderId || !products || products.length === 0) {
          reject(new Error('Invalid order data for bill generation'));
          return;
        }

        billCounter += 1;
        const billNumber = `BILL-${String(billCounter).padStart(5, '0')}`;
        const now = new Date();
        const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // Build line items from processed products
        const lineItems = products.map((product) => {
          const unitPrice = UNIT_PRICES[product.id] ?? DEFAULT_UNIT_PRICE;
          const batches = (product.batches || []).filter(
            (b) => b.batchNumber && Number(b.quantity) > 0
          );

          const batchDetails = batches.map((b) => ({
            batchNumber: b.batchNumber,
            quantity: Number(b.quantity),
            unitPrice,
            amount: Number(b.quantity) * unitPrice,
          }));

          const totalQty = batchDetails.reduce((s, b) => s + b.quantity, 0);
          const lineTotal = batchDetails.reduce((s, b) => s + b.amount, 0);

          return {
            productId: product.id,
            productName: product.name,
            requiredQty: product.requiredQty,
            processedQty: totalQty,
            unitPrice,
            batches: batchDetails,
            lineTotal,
          };
        });

        const subtotal = lineItems.reduce((s, li) => s + li.lineTotal, 0);
        const discountAmount = (subtotal * Math.min(discountPercent, 100)) / 100;
        const taxableAmount = subtotal - discountAmount;
        const cgst = taxableAmount * (GST_RATE / 2);
        const sgst = taxableAmount * (GST_RATE / 2);
        const grandTotal = taxableAmount + cgst + sgst;

        const bill = {
          billNumber,
          orderId,
          customer,
          substation,
          substationId,
          createdAt: now.toISOString(),
          dueDate: dueDate.toISOString(),
          status: 'GENERATED',
          discountPercent,
          lineItems,
          subtotal: round(subtotal),
          discountAmount: round(discountAmount),
          taxableAmount: round(taxableAmount),
          gstRate: GST_RATE * 100,
          cgst: round(cgst),
          sgst: round(sgst),
          totalTax: round(cgst + sgst),
          grandTotal: round(grandTotal),
          totalItems: lineItems.reduce((s, li) => s + li.processedQty, 0),
          totalLineItems: lineItems.length,
        };

        resolve(bill);
      }, 600);
    });
  },

  /**
   * Confirm a bill (change status to CONFIRMED).
   */
  confirmBill: (billNumber) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          billNumber,
          status: 'CONFIRMED',
          confirmedAt: new Date().toISOString(),
        });
      }, 300);
    });
  },

  /**
   * Get all orders that are ready for bill generation.
   * An order is "ready" when all its sub-station products are processed (status COMPLETED).
   */
  getOrdersReadyForBill: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: simulate some orders that have been fully processed
        const readyOrders = [
          {
            orderId: 'ORD-001',
            orderNumber: 'ORD-001',
            customer: 'City Hospital',
            customerCode: 'CUST-001',
            substation: 'ABBOTT',
            substationId: 'STN-ABBOTT',
            processedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            totalProducts: 4,
            totalUnits: 345,
            estimatedAmount: 1875.0,
            billStatus: 'PENDING', // PENDING | BILLED
          },
          {
            orderId: 'ORD-002',
            orderNumber: 'ORD-002',
            customer: 'Regional Medical Center',
            customerCode: 'CUST-002',
            substation: 'ABBOTT',
            substationId: 'STN-ABBOTT',
            processedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            totalProducts: 3,
            totalUnits: 430,
            estimatedAmount: 2245.0,
            billStatus: 'PENDING',
          },
          {
            orderId: 'ORD-003',
            orderNumber: 'ORD-003',
            customer: 'Community Health Clinic',
            customerCode: 'CUST-003',
            substation: 'CIPLA',
            substationId: 'STN-CIPLA',
            processedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            totalProducts: 5,
            totalUnits: 610,
            estimatedAmount: 3890.5,
            billStatus: 'BILLED',
          },
          {
            orderId: 'ORD-004',
            orderNumber: 'ORD-004',
            customer: 'District General Hospital',
            customerCode: 'CUST-004',
            substation: 'CIPLA',
            substationId: 'STN-CIPLA',
            processedAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
            totalProducts: 2,
            totalUnits: 350,
            estimatedAmount: 1534.0,
            billStatus: 'PENDING',
          },
          {
            orderId: 'ORD-005',
            orderNumber: 'ORD-005',
            customer: 'Sunrise Medical Hall',
            customerCode: 'CUST-005',
            substation: 'MANKIND',
            substationId: 'STN-MANKIND',
            processedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            totalProducts: 6,
            totalUnits: 820,
            estimatedAmount: 5430.0,
            billStatus: 'BILLED',
          },
          {
            orderId: 'ORD-006',
            orderNumber: 'ORD-006',
            customer: 'Prime Health Pharmacy',
            customerCode: 'CUST-006',
            substation: 'LUPIN',
            substationId: 'STN-LUPIN',
            processedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            totalProducts: 3,
            totalUnits: 280,
            estimatedAmount: 2140.0,
            billStatus: 'PENDING',
          },
        ];
        resolve(readyOrders);
      }, 400);
    });
  },

  /**
   * Get aggregated bill stats for the dashboard.
   */
  getBillStats: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalReady: 6,
          pendingBill: 4,
          billed: 2,
          totalRevenue: 17114.5,
          todayBilled: 1,
          todayRevenue: 3890.5,
        });
      }, 200);
    });
  },

  /**
   * Get bill history (mock).
   */
  getBillHistory: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            billNumber: 'BILL-00998',
            orderId: 'ORD-099',
            customer: 'City Hospital',
            grandTotal: 1524.50,
            status: 'CONFIRMED',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            billNumber: 'BILL-00999',
            orderId: 'ORD-100',
            customer: 'Regional Medical Center',
            grandTotal: 2890.00,
            status: 'GENERATED',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      }, 300);
    });
  },
};

// ── Helpers ──────────────────────────────────────────────────────
function round(num) {
  return Math.round(num * 100) / 100;
}

export default billService;
