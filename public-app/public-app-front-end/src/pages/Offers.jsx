import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OffersHeader from '../components/Offers/OffersHeader';
import OfferCard from '../components/Offers/OfferCard';
import OffersFilters from '../components/Offers/OffersFilters';
import OffersSummary from '../components/Offers/OffersSummary';

export default function OffersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    category: 'all',
    discountRange: 'all',
    type: 'all',
    validity: 'all',
    search: '',
  });
  const [viewMode, setViewMode] = useState('grid');
  const [savedOffers, setSavedOffers] = useState([]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Mock offers data
  const offersData = [
    {
      id: 'OFFER-001',
      title: 'Antibiotic Bundle Discount',
      description: 'Get 20% off on all antibiotic medications when you buy 10+ packets',
      category: 'antibiotics',
      discount: 20,
      discountType: 'percentage',
      originalPrice: 10000,
      offerPrice: 8000,
      type: 'bulk',
      validFrom: '2026-03-01',
      validUpto: '2026-03-31',
      minQuantity: 10,
      maxQuantity: null,
      applicableProducts: ['Amoxicillin', 'Azithromycin', 'Cephalexin'],
      image: '💊',
      badge: 'Popular',
      status: 'active',
      savings: 2000,
    },
    {
      id: 'OFFER-002',
      title: 'Spring Vitamin Sale',
      description: 'Flat 30% discount on all vitamin supplements',
      category: 'vitamins',
      discount: 30,
      discountType: 'percentage',
      originalPrice: 5000,
      offerPrice: 3500,
      type: 'seasonal',
      validFrom: '2026-03-01',
      validUpto: '2026-05-31',
      minQuantity: 1,
      maxQuantity: 100,
      applicableProducts: ['Vitamin C', 'Vitamin D3', 'Multivitamin', 'B-Complex'],
      image: '🌿',
      badge: 'Extended',
      status: 'active',
      savings: 1500,
    },
    {
      id: 'OFFER-003',
      title: 'Cold & Cough Combo',
      description: 'Buy cold medications combo & get additional 15% off',
      category: 'cold-cough',
      discount: 15,
      discountType: 'percentage',
      originalPrice: 3500,
      offerPrice: 2975,
      type: 'combo',
      validFrom: '2026-03-15',
      validUpto: '2026-04-15',
      minQuantity: 3,
      maxQuantity: 50,
      applicableProducts: ['Cough Syrup', 'Throat Lozenges', 'Decongestant'],
      image: '🤧',
      badge: 'New',
      status: 'active',
      savings: 525,
    },
    {
      id: 'OFFER-004',
      title: 'Loyalty Rewards Program',
      description: 'Earn points on every purchase & redeem for discounts',
      category: 'general',
      discount: 5,
      discountType: 'percentage',
      originalPrice: null,
      offerPrice: null,
      type: 'loyalty',
      validFrom: '2026-01-01',
      validUpto: '2026-12-31',
      minQuantity: 1,
      maxQuantity: null,
      applicableProducts: ['All Products'],
      image: '⭐',
      badge: 'Year Round',
      status: 'active',
      savings: null,
    },
    {
      id: 'OFFER-005',
      title: 'Dermatology Products Flash Sale',
      description: '25% off on selected dermatology & skincare products - Limited time!',
      category: 'dermatology',
      discount: 25,
      discountType: 'percentage',
      originalPrice: 8000,
      offerPrice: 6000,
      type: 'flash-sale',
      validFrom: '2026-03-18',
      validUpto: '2026-03-25',
      minQuantity: 1,
      maxQuantity: 200,
      applicableProducts: ['Moisturizers', 'Sunscreen', 'Ointments'],
      image: '🧴',
      badge: 'Flash Sale',
      status: 'active',
      savings: 2000,
    },
    {
      id: 'OFFER-006',
      title: 'Digestive Health Promo',
      description: 'Get ₹500 off on every 5 units of digestive aids',
      category: 'digestive',
      discount: 500,
      discountType: 'fixed',
      originalPrice: 4500,
      offerPrice: 4000,
      type: 'bulk',
      validFrom: '2026-03-10',
      validUpto: '2026-04-30',
      minQuantity: 5,
      maxQuantity: 100,
      applicableProducts: ['Antacids', 'Probiotics', 'Enzymes'],
      image: '🫙',
      badge: 'Running',
      status: 'active',
      savings: 500,
    },
    {
      id: 'OFFER-007',
      title: 'Pain Management Mega Deal',
      description: 'Buy pain relievers in bulk - up to 35% discount',
      category: 'pain-relief',
      discount: 35,
      discountType: 'percentage',
      originalPrice: 6000,
      offerPrice: 3900,
      type: 'bulk',
      validFrom: '2026-02-15',
      validUpto: '2026-03-31',
      minQuantity: 15,
      maxQuantity: null,
      applicableProducts: ['Paracetamol', 'Ibuprofen', 'Aspirin'],
      image: '💉',
      badge: 'Ending Soon',
      status: 'active',
      savings: 2100,
    },
    {
      id: 'OFFER-008',
      title: 'First Order Discount',
      description: 'New customers get 10% off on first order above ₹5000',
      category: 'general',
      discount: 10,
      discountType: 'percentage',
      originalPrice: null,
      offerPrice: null,
      type: 'new-customer',
      validFrom: '2026-03-01',
      validUpto: '2026-12-31',
      minQuantity: 1,
      maxQuantity: null,
      applicableProducts: ['All Products'],
      image: '🎁',
      badge: 'New Customers',
      status: 'active',
      savings: null,
    },
  ];

  // Filter offers based on selected filters
  const filteredOffers = useMemo(() => {
    let filtered = [...offersData];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter((offer) => offer.category === filters.category);
    }

    // Discount range filter
    if (filters.discountRange !== 'all') {
      filtered = filtered.filter((offer) => {
        const discountValue = offer.discountType === 'percentage' ? offer.discount : 0;
        if (filters.discountRange === '10-20') return discountValue >= 10 && discountValue <= 20;
        if (filters.discountRange === '20-30') return discountValue >= 20 && discountValue <= 30;
        if (filters.discountRange === '30+') return discountValue > 30;
        return true;
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((offer) => offer.type === filters.type);
    }

    // Validity filter
    if (filters.validity !== 'all') {
      const today = new Date('2026-03-18');
      const daysRemaining = (offer) => {
        const validUpto = new Date(offer.validUpto);
        return Math.ceil((validUpto - today) / (1000 * 60 * 60 * 24));
      };

      filtered = filtered.filter((offer) => {
        const days = daysRemaining(offer);
        if (filters.validity === 'ending-soon') return days <= 7 && days > 0;
        if (filters.validity === 'new') return days > 14;
        return true;
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(searchLower) ||
          offer.description.toLowerCase().includes(searchLower) ||
          offer.applicableProducts.some((prod) => prod.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [filters]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      totalOffers: offersData.length,
      activeOffers: offersData.filter((o) => o.status === 'active').length,
      totalSavings: offersData
        .filter((o) => o.savings)
        .reduce((sum, o) => sum + (o.savings || 0), 0),
      averageDiscount: Math.round(
        offersData
          .filter((o) => o.discountType === 'percentage')
          .reduce((sum, o) => sum + o.discount, 0) / offersData.filter((o) => o.discountType === 'percentage').length
      ),
    };
  }, []);

  const handleSaveOffer = (offerId) => {
    if (savedOffers.includes(offerId)) {
      setSavedOffers(savedOffers.filter((id) => id !== offerId));
    } else {
      setSavedOffers([...savedOffers, offerId]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <OffersHeader onBackClick={() => navigate('/dashboard')} />

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Summary Cards */}
        <OffersSummary summary={summary} savedCount={savedOffers.length} />

        {/* Filters and Controls */}
        <OffersFilters
          filters={filters}
          onFilterChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultsCount={filteredOffers.length}
        />

        {/* Offers Grid/List */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'
              : 'space-y-4 mt-6'
          }
        >
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isSaved={savedOffers.includes(offer.id)}
                onSave={handleSaveOffer}
                viewMode={viewMode}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg">No offers found matching your criteria</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Saved Offers Section */}
        {savedOffers.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📌 Saved Offers ({savedOffers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offersData
                .filter((o) => savedOffers.includes(o.id))
                .map((offer) => (
                  <div key={offer.id} className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                      <button
                        onClick={() => handleSaveOffer(offer.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{offer.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-600">
                        {offer.discount}{offer.discountType === 'percentage' ? '%' : ' ₹'} off
                      </span>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                        Order Now
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
