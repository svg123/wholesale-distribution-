import React, { useState, useMemo } from 'react';
import {
  FiPackage, FiCheckCircle, FiXCircle, FiAlertTriangle,
  FiSearch, FiFilter, FiPlus, FiSave, FiFlag, FiFileText,
  FiRefreshCw, FiClock, FiCheck, FiEdit3, FiEye, FiX,
  FiTrendingUp, FiBarChart2, FiClipboard, FiUser
} from 'react-icons/fi';
import VoiceSearchInput from '../../components/common/VoiceSearchInput';

const SECTIONS = [
  { id: 'A', label: 'Section A', description: 'General Medicines & OTC', color: 'blue', bgClass: 'bg-blue-500', bgMutedClass: 'bg-blue-100', textClass: 'text-blue-700', borderLightClass: 'border-blue-200' },
  { id: 'B', label: 'Section B', description: 'Antibiotics & Prescription', color: 'green', bgClass: 'bg-green-500', bgMutedClass: 'bg-green-100', textClass: 'text-green-700', borderLightClass: 'border-green-200' },
  { id: 'C', label: 'Section C', description: 'Surgical & Equipment', color: 'purple', bgClass: 'bg-purple-500', bgMutedClass: 'bg-purple-100', textClass: 'text-purple-700', borderLightClass: 'border-purple-200' },
];

const StockChecking = () => {
  const [activeTab, setActiveTab] = useState('check');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [showConcernModal, setShowConcernModal] = useState(false);
  const [concernText, setConcernText] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [stockData, setStockData] = useState([
    // Section A
    { id: 'PRD-001', name: 'Paracetamol 500mg', section: 'A', batch: 'B-2026-045', computerQty: 500, actualQty: 500, unit: 'tabs', expiry: '2027-06', lastChecked: '2026-03-24' },
    { id: 'PRD-002', name: 'Cetirizine 10mg', section: 'A', batch: 'B-2026-032', computerQty: 300, actualQty: 295, unit: 'tabs', expiry: '2027-09', lastChecked: '2026-03-24' },
    { id: 'PRD-003', name: 'Omeprazole 20mg', section: 'A', batch: 'B-2026-051', computerQty: 200, actualQty: 200, unit: 'caps', expiry: '2027-12', lastChecked: '2026-03-24' },
    { id: 'PRD-004', name: 'ORS Sachets', section: 'A', batch: 'B-2026-028', computerQty: 150, actualQty: 142, unit: 'sachets', expiry: '2028-01', lastChecked: '2026-03-24' },
    { id: 'PRD-005', name: 'Antacid Syrup 200ml', section: 'A', batch: 'B-2026-067', computerQty: 80, actualQty: 80, unit: 'bottles', expiry: '2027-08', lastChecked: '2026-03-24' },
    // Section B
    { id: 'PRD-006', name: 'Amoxicillin 500mg', section: 'B', batch: 'B-2026-039', computerQty: 400, actualQty: 398, unit: 'caps', expiry: '2027-05', lastChecked: '2026-03-23' },
    { id: 'PRD-007', name: 'Azithromycin 250mg', section: 'B', batch: 'B-2026-044', computerQty: 250, actualQty: 250, unit: 'tabs', expiry: '2027-11', lastChecked: '2026-03-23' },
    { id: 'PRD-008', name: 'Metronidazole 400mg', section: 'B', batch: 'B-2026-056', computerQty: 180, actualQty: 175, unit: 'tabs', expiry: '2027-07', lastChecked: '2026-03-23' },
    { id: 'PRD-009', name: 'Ciprofloxacin 500mg', section: 'B', batch: 'B-2026-048', computerQty: 320, actualQty: 320, unit: 'tabs', expiry: '2027-10', lastChecked: '2026-03-23' },
    // Section C
    { id: 'PRD-010', name: 'Surgical Gloves (S)', section: 'C', batch: 'B-2026-022', computerQty: 1000, actualQty: 980, unit: 'pairs', expiry: '2029-01', lastChecked: '2026-03-22' },
    { id: 'PRD-011', name: 'Surgical Masks N95', section: 'C', batch: 'B-2026-033', computerQty: 500, actualQty: 500, unit: 'pcs', expiry: '2028-06', lastChecked: '2026-03-22' },
    { id: 'PRD-012', name: 'Syringe 5ml', section: 'C', batch: 'B-2026-041', computerQty: 800, actualQty: 795, unit: 'pcs', expiry: '2029-03', lastChecked: '2026-03-22' },
    { id: 'PRD-013', name: 'Bandage Roll 6cm', section: 'C', batch: 'B-2026-055', computerQty: 200, actualQty: 200, unit: 'rolls', expiry: '2028-12', lastChecked: '2026-03-22' },
    { id: 'PRD-014', name: 'Cotton Wool 500g', section: 'C', batch: 'B-2026-060', computerQty: 120, actualQty: 115, unit: 'packs', expiry: '2029-06', lastChecked: '2026-03-22' },
  ]);

  const [concerns, setConcerns] = useState([
    { id: 'CON-001', productId: 'PRD-002', productName: 'Cetirizine 10mg', section: 'A', text: '5 tablets short. Possible counting error or breakage. Needs re-verification.', flaggedAt: '2026-03-24 11:00 AM', flaggedBy: 'Rajesh Kumar', status: 'OPEN' },
    { id: 'CON-002', productId: 'PRD-004', productName: 'ORS Sachets', section: 'A', text: '8 sachets missing from Section A. Checking dispatch records.', flaggedAt: '2026-03-24 11:15 AM', flaggedBy: 'Rajesh Kumar', status: 'UNDER_REVIEW' },
    { id: 'CON-003', productId: 'PRD-010', productName: 'Surgical Gloves (S)', section: 'C', text: '20 pairs discrepancy. Some may have been used for dispensing without logging.', flaggedAt: '2026-03-22 03:00 PM', flaggedBy: 'Rajesh Kumar', status: 'RESOLVED' },
  ]);

  const filteredStock = useMemo(() => {
    return stockData.filter((item) => {
      const matchesSection = item.section === selectedSection;
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batch.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesSearch;
    });
  }, [stockData, selectedSection, searchQuery]);

  const sectionStats = useMemo(() => {
    const stats = {};
    SECTIONS.forEach((section) => {
      const items = stockData.filter((item) => item.section === section.id);
      const matched = items.filter((item) => item.computerQty === item.actualQty).length;
      const mismatched = items.filter((item) => item.computerQty !== item.actualQty).length;
      const totalDiscrepancy = items.reduce((sum, item) => sum + Math.abs(item.computerQty - item.actualQty), 0);
      stats[section.id] = { total: items.length, matched, mismatched, totalDiscrepancy, items };
    });
    return stats;
  }, [stockData]);

  const overallStats = useMemo(() => ({
    totalProducts: stockData.length,
    matched: stockData.filter((item) => item.computerQty === item.actualQty).length,
    mismatched: stockData.filter((item) => item.computerQty !== item.actualQty).length,
    totalDiscrepancy: stockData.reduce((sum, item) => sum + Math.abs(item.computerQty - item.actualQty), 0),
    openConcerns: concerns.filter((c) => c.status === 'OPEN').length,
  }), [stockData, concerns]);

  const handleUpdateActualQty = (productId, newQty) => {
    setStockData((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, actualQty: parseInt(newQty, 10) || 0 } : item))
    );
  };

  const handleSaveTally = () => {
    setIsEditing(false);
  };

  const handleFlagConcern = () => {
    if (selectedProduct && concernText.trim()) {
      setConcerns((prev) => [
        ...prev,
        {
          id: `CON-${String(prev.length + 1).padStart(3, '0')}`,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          section: selectedProduct.section,
          text: concernText,
          flaggedAt: new Date().toLocaleString(),
          flaggedBy: 'Rajesh Kumar',
          status: 'OPEN',
        },
      ]);
    }
    setShowConcernModal(false);
    setConcernText('');
    setSelectedProduct(null);
  };

  const tabs = [
    { id: 'check', label: 'Stock Check', icon: FiClipboard },
    { id: 'concerns', label: 'Concerns Log', icon: FiFlag },
    { id: 'summary', label: 'Summary', icon: FiBarChart2 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Checking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Daily stock tally — computer vs actual count</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'check' && (
            <>
              {isEditing ? (
                <button
                  onClick={handleSaveTally}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiSave className="w-4 h-4" />
                  Save Tally
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <FiEdit3 className="w-4 h-4" />
                  Edit Tally
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card">
          <div className="card-body py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <FiPackage className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Products</p>
                <p className="text-xl font-bold text-gray-900">{overallStats.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Matched</p>
                <p className="text-xl font-bold text-green-600">{overallStats.matched}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <FiXCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Mismatched</p>
                <p className="text-xl font-bold text-red-600">{overallStats.mismatched}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Discrepancy</p>
                <p className="text-xl font-bold text-amber-600">{overallStats.totalDiscrepancy}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                <FiFlag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Open Concerns</p>
                <p className="text-xl font-bold text-orange-600">{overallStats.openConcerns}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Stock Check Tab */}
      {activeTab === 'check' && (
        <div className="space-y-4">
          {/* Section Selector + Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSection === section.id
                      ? `${section.bgMutedClass} ${section.textClass} border ${section.borderLightClass}`
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <VoiceSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={(val) => setSearchQuery(val)}
                placeholder="Search by product name, ID, or batch..."
                inputWidth="w-full"
              />
            </div>
          </div>

          {/* Section Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${SECTIONS.find((s) => s.id === selectedSection)?.bgClass || 'bg-gray-500'}`} />
              <span className="text-sm font-semibold text-gray-700">
                {SECTIONS.find((s) => s.id === selectedSection)?.label}
              </span>
              <span className="text-xs text-gray-400">
                — {SECTIONS.find((s) => s.id === selectedSection)?.description}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {sectionStats[selectedSection]?.matched} matched / {sectionStats[selectedSection]?.mismatched} mismatched
            </span>
          </div>

          {/* Stock Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Computer Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual Qty</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Checked</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStock.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No products in this section</td>
                    </tr>
                  ) : (
                    filteredStock.map((item) => {
                      const isMatch = item.computerQty === item.actualQty;
                      const discrepancy = Math.abs(item.computerQty - item.actualQty);
                      return (
                        <tr key={item.id} className={`hover:bg-gray-50 ${!isMatch ? 'bg-red-50/30' : ''}`}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-400">{item.id} • {item.unit}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.batch}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{item.computerQty.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.actualQty}
                                onChange={(e) => handleUpdateActualQty(item.id, e.target.value)}
                                className="w-20 text-right px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-300"
                                min={0}
                              />
                            ) : (
                              <span className={`font-medium ${isMatch ? 'text-gray-900' : 'text-red-600 font-semibold'}`}>
                                {item.actualQty.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isMatch ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                <FiCheck className="w-3 h-3" /> Match
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                <FiX className="w-3 h-3" /> -{discrepancy}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.expiry}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.lastChecked}</td>
                          <td className="px-4 py-3 text-center">
                            {!isMatch && (
                              <button
                                onClick={() => {
                                  setSelectedProduct(item);
                                  setShowConcernModal(true);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                              >
                                <FiFlag className="w-3 h-3" />
                                Flag
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Concerns Log Tab */}
      {activeTab === 'concerns' && (
        <div className="space-y-3">
          {concerns.length === 0 ? (
            <div className="card p-8 text-center">
              <FiFlag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">No concerns logged yet</p>
            </div>
          ) : (
            concerns.map((concern) => (
              <div key={concern.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                        concern.status === 'OPEN' ? 'bg-red-100 text-red-600' :
                        concern.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <FiFlag className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">{concern.id}</span>
                          <span className="text-sm font-semibold text-gray-900">{concern.productName}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            concern.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                            concern.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {concern.status.replace('_', ' ')}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Section {concern.section}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{concern.text}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {concern.flaggedAt}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            {concern.flaggedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SECTIONS.map((section) => {
            const stats = sectionStats[section.id];
            const matchPercent = stats.total > 0 ? Math.round((stats.matched / stats.total) * 100) : 0;
            return (
              <div key={section.id} className="card">
                <div className="card-header">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${section.bgClass}`} />
                    <h3 className="text-base font-semibold text-gray-900">{section.label}</h3>
                  </div>
                  <span className="text-xs text-gray-400">{section.description}</span>
                </div>
                <div className="card-body space-y-4">
                  <div className="text-center py-3">
                    <div className="relative inline-flex items-center justify-center w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                        <circle
                          cx="40" cy="40" r="36"
                          stroke={matchPercent === 100 ? '#10b981' : matchPercent > 70 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${matchPercent * 2.26} ${226 - matchPercent * 2.26}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className={`absolute text-lg font-bold ${
                        matchPercent === 100 ? 'text-green-600' : matchPercent > 70 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {matchPercent}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Match Rate</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-500">Total Products</span>
                      <span className="text-sm font-medium text-gray-900">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-500">Matched</span>
                      <span className="text-sm font-medium text-green-600">{stats.matched}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-500">Mismatched</span>
                      <span className="text-sm font-medium text-red-600">{stats.mismatched}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-500">Total Discrepancy</span>
                      <span className="text-sm font-medium text-amber-600">{stats.totalDiscrepancy}</span>
                    </div>
                  </div>

                  {/* Mismatched items list */}
                  {stats.items.filter((i) => i.computerQty !== i.actualQty).length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Discrepancies</p>
                      {stats.items.filter((i) => i.computerQty !== i.actualQty).map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1">
                          <span className="text-xs text-gray-600">{item.name}</span>
                          <span className="text-xs font-medium text-red-600">
                            -{Math.abs(item.computerQty - item.actualQty)} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Flag Concern Modal */}
      {showConcernModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiFlag className="w-5 h-5 text-orange-500" />
                Flag Concern
              </h3>
              <button onClick={() => setShowConcernModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500">{selectedProduct.id} • Batch: {selectedProduct.batch}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Computer: {selectedProduct.computerQty}</p>
                  <p className="text-sm font-semibold text-red-600">Actual: {selectedProduct.actualQty}</p>
                  <p className="text-xs text-red-500">Diff: {Math.abs(selectedProduct.computerQty - selectedProduct.actualQty)}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe the concern</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Describe what you found, possible reasons, and any action taken..."
                value={concernText}
                onChange={(e) => setConcernText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConcernModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagConcern}
                disabled={!concernText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <FiFlag className="w-4 h-4" />
                Submit Concern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockChecking;
