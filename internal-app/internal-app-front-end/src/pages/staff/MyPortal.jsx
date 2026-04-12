import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiDollarSign,
  FiEdit3, FiSave, FiX, FiBriefcase, FiHome, FiCreditCard,
  FiAward, FiHeart
} from 'react-icons/fi';
import VoiceSearchInput from '../../components/common/VoiceSearchInput';

const MyPortal = () => {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || 'Rajesh Kumar',
    email: user?.email || 'rajesh.kumar@ivrpharma.com',
    phone: '+91 98765 43210',
    dateOfBirth: '1992-05-15',
    age: 32,
    gender: 'Male',
    bloodGroup: 'B+',
    maritalStatus: 'Married',
    aadharNumber: 'XXXX-XXXX-4532',
    panNumber: 'ABCPK1234F',
    emergencyContact: '+91 87654 32109',
    address: 'Sector 12, Gurgaon, Haryana 122001',
  });

  const [workInfo, setWorkInfo] = useState({
    employeeId: 'EMP-2024-047',
    department: 'Dispatch Operations',
    designation: 'Sub-Station Operator',
    role: 'STAFF',
    dutyType: 'Full-Time',
    reportingTo: 'Vikram Singh (Manager)',
    posting: {
      substation: 'STN-CIPLA',
      substationName: 'Cipla',
      zone: 'Zone B - Station 1',
      shift: 'Morning (6:00 AM - 2:00 PM)',
      joinedDate: '2024-01-15',
    },
  });

  const [salaryInfo, setSalaryInfo] = useState({
    basicPay: 25000,
    hra: 7500,
    da: 5000,
    specialAllowance: 3000,
    pf: 1800,
    esi: 500,
    tax: 1200,
    totalDeductions: 3500,
    netSalary: 37000,
    bankName: 'State Bank of India',
    accountNumber: 'XXXX-XXXX-7890',
    ifscCode: 'SBIN0001234',
    lastPayDate: '2026-03-01',
    nextPayDate: '2026-04-01',
  });

  const handlePersonalChange = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In production, this would call an API
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'work', label: 'Work & Posting', icon: FiBriefcase },
    { id: 'salary', label: 'Salary Details', icon: FiDollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Portal</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage your personal information</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiX className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiSave className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <FiEdit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Summary Card */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {personalInfo.fullName?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{personalInfo.fullName}</h2>
              <p className="text-sm text-gray-500">{workInfo.designation} • {workInfo.employeeId}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <FiMapPin className="w-3 h-3" />
                  {workInfo.posting.substationName} • {workInfo.posting.zone}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <FiCalendar className="w-3 h-3" />
                  Joined {workInfo.posting.joinedDate}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                ● Active
              </div>
              <p className="text-xs text-gray-400 mt-1">{workInfo.posting.shift}</p>
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

      {/* Tab Content */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiUser className="w-4 h-4 text-primary-500" />
                Basic Information
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => handlePersonalChange('email', e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.email}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => handlePersonalChange('phone', e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                  <p className="text-sm text-gray-900 font-medium">{personalInfo.dateOfBirth}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Age</label>
                  <p className="text-sm text-gray-900 font-medium">{personalInfo.age} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                  <p className="text-sm text-gray-900 font-medium">{personalInfo.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Blood Group</label>
                  <p className="text-sm text-gray-900 font-medium">{personalInfo.bloodGroup}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Marital Status</label>
                  <div className="flex items-center gap-2">
                    <FiHeart className="w-4 h-4 text-pink-400" />
                    <p className="text-sm text-gray-900 font-medium">{personalInfo.maritalStatus}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Emergency Contact</label>
                  <p className="text-sm text-gray-900 font-medium">{personalInfo.emergencyContact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Identity Documents */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiCreditCard className="w-4 h-4 text-primary-500" />
                Identity & Address
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Aadhar Number</p>
                    <p className="text-sm font-medium text-gray-900">{personalInfo.aadharNumber}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">PAN Number</p>
                    <p className="text-sm font-medium text-gray-900">{personalInfo.panNumber}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <FiHome className="w-3.5 h-3.5 inline mr-1" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={personalInfo.address}
                    onChange={(e) => handlePersonalChange('address', e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{personalInfo.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'work' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Work Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiBriefcase className="w-4 h-4 text-primary-500" />
                Work Details
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Employee ID</label>
                  <p className="text-sm text-gray-900 font-mono">{workInfo.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                  <p className="text-sm text-gray-900 font-medium">{workInfo.department}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Designation</label>
                  <p className="text-sm text-gray-900 font-medium">{workInfo.designation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Duty Type</label>
                  <p className="text-sm text-gray-900 font-medium">{workInfo.dutyType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                  <span className="inline-flex px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {workInfo.role}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reporting To</label>
                  <p className="text-sm text-gray-900 font-medium">{workInfo.reportingTo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Posting Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-primary-500" />
                Posting Details
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-200 text-primary-700 rounded-lg flex items-center justify-center font-bold text-sm">
                    {workInfo.posting.substationName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-900">{workInfo.posting.substationName}</p>
                    <p className="text-xs text-primary-600">{workInfo.posting.zone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Sub-Station ID</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">{workInfo.posting.substation}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Current Shift</span>
                  <span className="text-sm font-medium text-gray-900">{workInfo.posting.shift}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Joined On</span>
                  <span className="text-sm font-medium text-gray-900">{workInfo.posting.joinedDate}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Tenure</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.floor((new Date() - new Date(workInfo.posting.joinedDate)) / (1000 * 60 * 60 * 24 * 30))} months
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Salary Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-primary-500" />
                Salary Breakdown
              </h3>
            </div>
            <div className="card-body space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Earnings</h4>
              <div className="space-y-2">
                {[
                  { label: 'Basic Pay', value: salaryInfo.basicPay },
                  { label: 'HRA', value: salaryInfo.hra },
                  { label: 'DA', value: salaryInfo.da },
                  { label: 'Special Allowance', value: salaryInfo.specialAllowance },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total Earnings</span>
                  <span className="text-sm font-bold text-gray-900">
                    ₹{(salaryInfo.basicPay + salaryInfo.hra + salaryInfo.da + salaryInfo.specialAllowance).toLocaleString()}
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">Deductions</h4>
              <div className="space-y-2">
                {[
                  { label: 'Provident Fund', value: salaryInfo.pf },
                  { label: 'ESI', value: salaryInfo.esi },
                  { label: 'Income Tax', value: salaryInfo.tax },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-medium text-red-600">-₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-primary-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">Net Salary</span>
                  <span className="text-xl font-bold text-primary-600">₹{salaryInfo.netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank & Pay Schedule */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FiCreditCard className="w-4 h-4 text-primary-500" />
                  Bank Details
                </h3>
              </div>
              <div className="card-body space-y-3">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-500">Bank Name</span>
                  <span className="text-sm font-medium text-gray-900">{salaryInfo.bankName}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-500">Account Number</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">{salaryInfo.accountNumber}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-500">IFSC Code</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">{salaryInfo.ifscCode}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-primary-500" />
                  Pay Schedule
                </h3>
              </div>
              <div className="card-body space-y-3">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-500">Last Pay Date</span>
                  <span className="text-sm font-medium text-green-600">{salaryInfo.lastPayDate}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-500">Next Pay Date</span>
                  <span className="text-sm font-medium text-gray-900">{salaryInfo.nextPayDate}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    ✓ Paid
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPortal;
