// Mock product data for the Medical Wholesale Application
import Fuse from 'fuse.js';

export const mockProducts = [
  {
    productCode: 'MED001',
    productName: 'Paracetamol 500mg Tablets',
    companyName: 'ABC Pharmaceuticals',
    composition: 'Paracetamol 500mg',
    category: 'Generic',
    stock: 5000,
    pricePerUnit: 2.50,
    gst: 12,
    scheme: { buy: 5, free: 1 },
  },
  {
    productCode: 'MED002',
    productName: 'Amoxicillin 250mg Capsules',
    companyName: 'XYZ Healthcare',
    composition: 'Amoxicillin Trihydrate 250mg',
    category: 'Ethical',
    stock: 3000,
    pricePerUnit: 8.75,
    gst: 12,
    scheme: { buy: 10, free: 2 },
  },
  {
    productCode: 'MED003',
    productName: 'Omeprazole 20mg Tablets',
    companyName: 'MediCore Ltd',
    composition: 'Omeprazole 20mg',
    category: 'Generic',
    stock: 2500,
    pricePerUnit: 5.20,
    gst: 12,
    scheme: null,
  },
  {
    productCode: 'MED004',
    productName: 'Cetirizine 10mg Tablets',
    companyName: 'AllerCare Pharma',
    composition: 'Cetirizine Hydrochloride 10mg',
    category: 'OTC',
    stock: 4500,
    pricePerUnit: 3.80,
    gst: 18,
    scheme: { buy: 5, free: 1 },
  },
  {
    productCode: 'MED005',
    productName: 'Metformin 500mg Tablets',
    companyName: 'DiabeCare',
    composition: 'Metformin Hydrochloride 500mg',
    category: 'Ethical',
    stock: 6000,
    pricePerUnit: 4.50,
    gst: 12,
    scheme: { buy: 10, free: 1 },
  },
  {
    productCode: 'MED006',
    productName: 'Atorvastatin 10mg Tablets',
    companyName: 'CardioHealth',
    composition: 'Atorvastatin Calcium 10mg',
    category: 'Ethical',
    stock: 1800,
    pricePerUnit: 12.50,
    gst: 12,
    scheme: { buy: 5, free: 1 },
  },
  {
    productCode: 'MED007',
    productName: 'Vitamin D3 60K IU Capsules',
    companyName: 'NutriMed',
    composition: 'Cholecalciferol 60,000 IU',
    category: 'OTC',
    stock: 3500,
    pricePerUnit: 15.00,
    gst: 18,
    scheme: null,
  },
  {
    productCode: 'MED008',
    productName: 'Azithromycin 500mg Tablets',
    companyName: 'BioTech Pharma',
    composition: 'Azithromycin Dihydrate 500mg',
    category: 'Ethical',
    stock: 2200,
    pricePerUnit: 18.75,
    gst: 12,
    scheme: { buy: 10, free: 3 },
  },
  {
    productCode: 'MED009',
    productName: 'Ibuprofen 400mg Tablets',
    companyName: 'PainRelief Inc',
    composition: 'Ibuprofen 400mg',
    category: 'OTC',
    stock: 5500,
    pricePerUnit: 3.25,
    gst: 18,
    scheme: { buy: 10, free: 2 },
  },
  {
    productCode: 'MED010',
    productName: 'Pantoprazole 40mg Tablets',
    companyName: 'GastroMed',
    composition: 'Pantoprazole Sodium 40mg',
    category: 'Generic',
    stock: 3800,
    pricePerUnit: 6.50,
    gst: 12,
    scheme: { buy: 5, free: 1 },
  },
  {
    productCode: 'MED011',
    productName: 'Montelukast 10mg Tablets',
    companyName: 'RespiroCare',
    composition: 'Montelukast Sodium 10mg',
    category: 'Ethical',
    stock: 2900,
    pricePerUnit: 9.80,
    gst: 12,
    scheme: null,
  },
  {
    productCode: 'MED012',
    productName: 'Multivitamin Tablets',
    companyName: 'HealthPlus',
    composition: 'Multivitamin & Minerals',
    category: 'OTC',
    stock: 7000,
    pricePerUnit: 4.20,
    gst: 18,
    scheme: { buy: 5, free: 1 },
  },
  {
    productCode: 'MED013',
    productName: 'Amlodipine 5mg Tablets',
    companyName: 'CardioHealth',
    composition: 'Amlodipine Besylate 5mg',
    category: 'Ethical',
    stock: 4200,
    pricePerUnit: 7.30,
    gst: 12,
    scheme: { buy: 10, free: 2 },
  },
  {
    productCode: 'MED014',
    productName: 'Ranitidine 150mg Tablets',
    companyName: 'GastroMed',
    composition: 'Ranitidine Hydrochloride 150mg',
    category: 'Generic',
    stock: 150,
    pricePerUnit: 3.50,
    gst: 12,
    scheme: { buy: 10, free: 1 },
  },
  {
    productCode: 'MED015',
    productName: 'Ciprofloxacin 500mg Tablets',
    companyName: 'BioTech Pharma',
    composition: 'Ciprofloxacin Hydrochloride 500mg',
    category: 'Ethical',
    stock: 2700,
    pricePerUnit: 11.20,
    gst: 12,
    scheme: { buy: 10, free: 2 },
  },
  {
    productCode: 'MED016',
    productName: 'Calcium + Vitamin D3 Tablets',
    companyName: 'BoneStrong',
    composition: 'Calcium Carbonate 500mg + Vitamin D3 250 IU',
    category: 'OTC',
    stock: 5200,
    pricePerUnit: 6.80,
    gst: 18,
    scheme: { buy: 5, free: 1 },
  },
  {
    productCode: 'MED017',
    productName: 'Losartan 50mg Tablets',
    companyName: 'CardioHealth',
    composition: 'Losartan Potassium 50mg',
    category: 'Ethical',
    stock: 3400,
    pricePerUnit: 8.90,
    gst: 12,
    scheme: null,
  },
  {
    productCode: 'MED018',
    productName: 'Levothyroxine 100mcg Tablets',
    companyName: 'ThyroMed',
    composition: 'Levothyroxine Sodium 100mcg',
    category: 'Ethical',
    stock: 2100,
    pricePerUnit: 10.50,
    gst: 12,
    scheme: { buy: 10, free: 1 },
  },
  {
    productCode: 'MED019',
    productName: 'Cough Syrup 100ml',
    companyName: 'RespiroCare',
    composition: 'Dextromethorphan 10mg/5ml + Chlorpheniramine 2mg/5ml',
    category: 'OTC',
    stock: 4800,
    pricePerUnit: 45.00,
    gst: 18,
    scheme: { buy: 5, free: 1 },
  },
  {
    productCode: 'MED020',
    productName: 'Diclofenac 50mg Tablets',
    companyName: 'PainRelief Inc',
    composition: 'Diclofenac Sodium 50mg',
    category: 'Standard',
    stock: 3900,
    pricePerUnit: 4.75,
    gst: 12,
    scheme: { buy: 10, free: 2 },
  },
];

// Fuse-based fuzzy search configuration
const fuseOptions = {
  includeScore: true,
  shouldSort: true,
  threshold: 0.45, // typo tolerance (0 = exact, 1 = very fuzzy)
  ignoreLocation: true,
  distance: 100,
  minMatchCharLength: 2,
  keys: [
    { name: 'composition', weight: 0.5 },
    { name: 'productName', weight: 0.25 },
    { name: 'productCode', weight: 0.15 },
    { name: 'companyName', weight: 0.1 },
  ],
};

let fuse = new Fuse(mockProducts, fuseOptions);

const normalizeQuery = (q) =>
  q
    .toLowerCase()
    .replace(/[+,]/g, ' ') // treat + and , as separators
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Enhanced fuzzy search supporting productName, productCode, composition and companyName
 * - normalizes separators and spaces
 * - handles typos and partial input via Fuse.js
 * - returns up to 10 ranked results
 */
export const searchProducts = (query) => {
  if (!query) return [];

  const normalized = normalizeQuery(query);
  if (normalized.length < 2) return [];

  // Use Fuse to search; Fuse handles typo tolerance and ranking based on weights
  try {
    const results = fuse.search(normalized, { limit: 10 });
    return results.map((r) => r.item);
  } catch (e) {
    // Fallback to simple contains() if something goes wrong
    const searchTerm = normalized;
    return mockProducts
      .filter((product) => {
        const hay = (
          product.productName + ' ' +
          product.productCode + ' ' +
          (product.composition || '') + ' ' +
          product.companyName
        ).toLowerCase();

        return searchTerm.split(' ').every((t) => hay.includes(t));
      })
      .slice(0, 10);
  }
};



/**
 * Get product by code
 * @param {string} code - Product code
 * @returns {Object|null} - Product or null
 */
export const getProductByCode = (code) => {
  return mockProducts.find((product) => product.productCode === code) || null;
};

/**
 * Validate stock availability
 * @param {string} productCode - Product code
 * @param {number} quantity - Requested quantity
 * @returns {Object} - Validation result
 */
export const validateStock = (productCode, quantity) => {
  const product = getProductByCode(productCode);
  
  if (!product) {
    return { valid: false, message: 'Product not found' };
  }
  
  if (quantity <= 0) {
    return { valid: false, message: 'Quantity must be greater than 0' };
  }
  
  if (quantity > product.stock) {
    return { 
      valid: false, 
      message: `Only ${product.stock} units available in stock`,
      availableStock: product.stock
    };
  }
  
  return { valid: true, message: 'Stock available' };
};

/**
 * Calculate free quantity based on scheme
 * @param {number} quantity - Purchase quantity
 * @param {Object} scheme - Scheme object {buy, free}
 * @returns {number} - Free quantity
 */
export const calculateFreeQuantity = (quantity, scheme) => {
  if (!scheme) return 0;
  return Math.floor(quantity / scheme.buy) * scheme.free;
};

/**
 * Calculate pricing with GST
 * @param {number} quantity - Quantity
 * @param {number} pricePerUnit - Price per unit
 * @param {number} gst - GST percentage
 * @returns {Object} - Pricing breakdown
 */
export const calculatePricing = (quantity, pricePerUnit, gst) => {
  const baseTotal = quantity * pricePerUnit;
  const gstAmount = (baseTotal * gst) / 100;
  const total = baseTotal + gstAmount;
  
  return {
    baseTotal: parseFloat(baseTotal.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

// Export all products
export default mockProducts;
