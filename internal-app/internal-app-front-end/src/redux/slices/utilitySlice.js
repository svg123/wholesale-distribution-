import { createSlice } from '@reduxjs/toolkit';

// ===== Mock Users for Utility Manager =====
const mockUsers = [
  { id: 1, name: 'Admin', role: 'ADMIN', email: 'admin@pharma.com', hasUtilityAccess: true },
  { id: 2, name: 'Rajesh Kumar', role: 'MANAGEMENT', email: 'rajesh@pharma.com', hasUtilityAccess: true },
  { id: 3, name: 'Ramesh Patel', role: 'STAFF', email: 'ramesh@pharma.com', hasUtilityAccess: true },
  { id: 4, name: 'Priya Sharma', role: 'STAFF', email: 'priya@pharma.com', hasUtilityAccess: false },
  { id: 5, name: 'Amit Singh', role: 'STAFF', email: 'amit@pharma.com', hasUtilityAccess: false },
  { id: 6, name: 'Suresh Yadav', role: 'STAFF', email: 'suresh@pharma.com', hasUtilityAccess: false },
  { id: 7, name: 'Vikram Joshi', role: 'MANAGEMENT', email: 'vikram@pharma.com', hasUtilityAccess: true },
  { id: 8, name: 'Deepa Nair', role: 'STAFF', email: 'deepa@pharma.com', hasUtilityAccess: false },
];

// ===== Mock Data =====
const mockPharmacists = [
  {
    id: 'PH-001',
    pharmacyName: 'City Medical Store',
    ownerName: 'Anil Mehta',
    pharmacistName: 'Dr. Suresh Gupta',
    addressLine1: '123 MG Road',
    addressLine2: 'Near City Mall',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    areaCode: 'AREA-001',
    mobile1: '9876543210',
    mobile2: '9876543211',
    drugLicense1: 'DL-2024-MH-001',
    drugLicense2: 'DL-2024-MH-002',
    gst: '27AABCM1234A1Z5',
    paymentTerms: 'Net 30',
  },
  {
    id: 'PH-002',
    pharmacyName: 'Health Plus Pharmacy',
    ownerName: 'Ravi Kumar',
    pharmacistName: 'Dr. Priya Das',
    addressLine1: '456 Station Road',
    addressLine2: 'Main Market',
    city: 'Pune',
    district: 'Pune City',
    areaCode: 'AREA-002',
    mobile1: '9876543212',
    mobile2: '',
    drugLicense1: 'DL-2024-MH-003',
    drugLicense2: '',
    gst: '27AABCR5678B2Z3',
    paymentTerms: 'Net 15',
  },
];

const mockSuppliers = [
  {
    id: 'SUP-001',
    supplierName: 'Sun Pharma Distributors',
    contactPerson: 'Vikram Shah',
    addressLine1: '789 Industrial Area',
    addressLine2: 'Phase 2',
    city: 'Mumbai',
    district: 'Thane',
    areaCode: 'AREA-001',
    mobile1: '9812345670',
    mobile2: '9812345671',
    drugLicense1: 'DL-2024-SUP-001',
    drugLicense2: 'DL-2024-SUP-002',
    gst: '27AABCS9012C3Z5',
    paymentTerms: 'Net 45',
  },
  {
    id: 'SUP-002',
    supplierName: 'Cipla Wholesale',
    contactPerson: 'Neha Patel',
    addressLine1: '321 Andheri East',
    addressLine2: '',
    city: 'Mumbai',
    district: 'Mumbai',
    areaCode: 'AREA-001',
    mobile1: '9812345672',
    mobile2: '',
    drugLicense1: 'DL-2024-SUP-003',
    drugLicense2: '',
    gst: '27AABCC3456D4Z7',
    paymentTerms: 'Net 30',
  },
];

const mockBrands = [
  { id: 'BR-001', name: 'Sun Pharma', type: 'ETHICAL', category: 'FAST MOVING' },
  { id: 'BR-002', name: 'Cipla', type: 'ETHICAL', category: 'FAST MOVING' },
  { id: 'BR-003', name: 'Abbott', type: 'ETHICAL', category: 'MOVING' },
  { id: 'BR-004', name: 'Mankind', type: 'GENERIC', category: 'FAST MOVING' },
  { id: 'BR-005', name: 'Dabur', type: 'OTC', category: 'MOVING' },
  { id: 'BR-006', name: 'Lupin', type: 'STANDARD', category: 'NORMAL' },
];

const mockProducts = [
  {
    id: 'PROD-001',
    name: 'Amoxicillin 500mg',
    size: '10 tablets',
    brandId: 'BR-002',
    brandName: 'Cipla',
    brandType: 'ETHICAL',
    medicineType: 'Strip',
    gst: 12,
    scheme: '10+1',
    schemeEnabled: true,
    composition: 'Amoxicillin 500mg',
    status: 'Active',
  },
  {
    id: 'PROD-002',
    name: 'Paracetamol 500mg',
    size: '15 tablets',
    brandId: 'BR-004',
    brandName: 'Mankind',
    brandType: 'GENERIC',
    medicineType: 'Strip',
    gst: 5,
    scheme: '',
    schemeEnabled: false,
    composition: 'Paracetamol 500mg',
    status: 'Active',
  },
  {
    id: 'PROD-003',
    name: 'Cetirizine 10mg',
    size: '10 tablets',
    brandId: 'BR-001',
    brandName: 'Sun Pharma',
    brandType: 'ETHICAL',
    medicineType: 'Strip',
    gst: 12,
    scheme: '25+3, 50+6',
    schemeEnabled: true,
    composition: 'Cetirizine 10mg',
    status: 'Active',
  },
];

const mockSchemes = [
  {
    id: 'SCH-001',
    productId: 'PROD-001',
    productName: 'Amoxicillin 500mg',
    tier1: { qty: 10, free: 1 },
    tier2: { qty: 25, free: 3 },
    tier3: { qty: 50, free: 6 },
  },
  {
    id: 'SCH-002',
    productId: 'PROD-003',
    productName: 'Cetirizine 10mg',
    tier1: { qty: 25, free: 3 },
    tier2: { qty: 50, free: 6 },
    tier3: { qty: 0, free: 0 },
  },
];

const mockAreas = [
  {
    id: 'AREA-001',
    name: 'Andheri West',
    city: 'Mumbai',
    priority: 1,
    subArea: 'Lokhandwala',
    grade: 'A',
  },
  {
    id: 'AREA-002',
    name: 'Koregaon Park',
    city: 'Pune',
    priority: 2,
    subArea: 'Lane 5',
    grade: 'A',
  },
  {
    id: 'AREA-003',
    name: 'MG Road',
    city: 'Pune',
    priority: 3,
    subArea: 'Camp Area',
    grade: 'B',
  },
];

const initialState = {
  // Utility access permissions
  users: mockUsers,
  
  // Sub-module data
  pharmacists: mockPharmacists,
  suppliers: mockSuppliers,
  brands: mockBrands,
  products: mockProducts,
  schemes: mockSchemes,
  areas: mockAreas,
  
  // UI state
  isLoading: false,
  error: null,
  activeSubModule: null,
};

const utilitySlice = createSlice({
  name: 'utility',
  initialState,
  reducers: {
    // ===== Utility Access Management =====
    toggleUtilityAccess: (state, action) => {
      const userId = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user && user.role === 'STAFF') {
        user.hasUtilityAccess = !user.hasUtilityAccess;
      }
    },
    grantUtilityAccess: (state, action) => {
      const userId = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user && user.role === 'STAFF') {
        user.hasUtilityAccess = true;
      }
    },
    revokeUtilityAccess: (state, action) => {
      const userId = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user && user.role === 'STAFF') {
        user.hasUtilityAccess = false;
      }
    },

    // ===== Pharmacist CRUD =====
    addPharmacist: (state, action) => {
      state.pharmacists.unshift(action.payload);
    },
    updatePharmacist: (state, action) => {
      const index = state.pharmacists.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.pharmacists[index] = action.payload;
    },
    deletePharmacist: (state, action) => {
      state.pharmacists = state.pharmacists.filter((p) => p.id !== action.payload);
    },
    importPharmacists: (state, action) => {
      action.payload.forEach((item) => {
        const exists = state.pharmacists.findIndex((p) => p.id === item.id);
        if (exists === -1) state.pharmacists.unshift(item);
        else state.pharmacists[exists] = item;
      });
    },

    // ===== Supplier CRUD =====
    addSupplier: (state, action) => {
      state.suppliers.unshift(action.payload);
    },
    updateSupplier: (state, action) => {
      const index = state.suppliers.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state.suppliers[index] = action.payload;
    },
    deleteSupplier: (state, action) => {
      state.suppliers = state.suppliers.filter((s) => s.id !== action.payload);
    },
    importSuppliers: (state, action) => {
      action.payload.forEach((item) => {
        const exists = state.suppliers.findIndex((s) => s.id === item.id);
        if (exists === -1) state.suppliers.unshift(item);
        else state.suppliers[exists] = item;
      });
    },

    // ===== Brand CRUD =====
    addBrand: (state, action) => {
      state.brands.unshift(action.payload);
    },
    updateBrand: (state, action) => {
      const index = state.brands.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) state.brands[index] = action.payload;
    },
    deleteBrand: (state, action) => {
      state.brands = state.brands.filter((b) => b.id !== action.payload);
    },
    importBrands: (state, action) => {
      action.payload.forEach((item) => {
        const exists = state.brands.findIndex((b) => b.id === item.id);
        if (exists === -1) state.brands.unshift(item);
        else state.brands[exists] = item;
      });
    },

    // ===== Product CRUD =====
    addProduct: (state, action) => {
      state.products.unshift(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.products[index] = action.payload;
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    importProducts: (state, action) => {
      action.payload.forEach((product) => {
        const exists = state.products.findIndex((p) => p.id === product.id);
        if (exists === -1) {
          state.products.unshift(product);
        } else {
          state.products[exists] = product;
        }
      });
    },

    // ===== Scheme CRUD =====
    addScheme: (state, action) => {
      state.schemes.unshift(action.payload);
    },
    updateScheme: (state, action) => {
      const index = state.schemes.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state.schemes[index] = action.payload;
    },
    deleteScheme: (state, action) => {
      state.schemes = state.schemes.filter((s) => s.id !== action.payload);
    },
    importSchemes: (state, action) => {
      action.payload.forEach((item) => {
        const exists = state.schemes.findIndex((s) => s.id === item.id);
        if (exists === -1) state.schemes.unshift(item);
        else state.schemes[exists] = item;
      });
    },

    // ===== Area CRUD =====
    addArea: (state, action) => {
      state.areas.unshift(action.payload);
    },
    updateArea: (state, action) => {
      const index = state.areas.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) state.areas[index] = action.payload;
    },
    deleteArea: (state, action) => {
      state.areas = state.areas.filter((a) => a.id !== action.payload);
    },
    importAreas: (state, action) => {
      action.payload.forEach((item) => {
        const exists = state.areas.findIndex((a) => a.id === item.id);
        if (exists === -1) state.areas.unshift(item);
        else state.areas[exists] = item;
      });
    },

    // ===== UI =====
    setActiveSubModule: (state, action) => {
      state.activeSubModule = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  toggleUtilityAccess,
  grantUtilityAccess,
  revokeUtilityAccess,
  addPharmacist,
  updatePharmacist,
  deletePharmacist,
  importPharmacists,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  importSuppliers,
  addBrand,
  updateBrand,
  deleteBrand,
  importBrands,
  addProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  addScheme,
  updateScheme,
  deleteScheme,
  importSchemes,
  addArea,
  updateArea,
  deleteArea,
  importAreas,
  setActiveSubModule,
  setLoading,
  setError,
  clearError,
} = utilitySlice.actions;

export default utilitySlice.reducer;
