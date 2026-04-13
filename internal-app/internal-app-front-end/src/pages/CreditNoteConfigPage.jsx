import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConfigStart,
  fetchConfigSuccess,
  fetchConfigFailure,
  updateConfigStart,
  updateConfigSuccess,
  updateConfigFailure,
  fetchAreaConfigsStart,
  fetchAreaConfigsSuccess,
  fetchAreaConfigsFailure,
  upsertAreaConfigStart,
  upsertAreaConfigSuccess,
  upsertAreaConfigFailure,
  deleteAreaConfigStart,
  deleteAreaConfigSuccess,
  deleteAreaConfigFailure,
  clearError,
} from '../redux/slices/creditNoteSlice';
import creditNoteService from '../services/creditNoteService';
import CreditNoteConfigPanel from '../components/credit-note/CreditNoteConfigPanel';
import { PageLoader } from '../components/common/LoadingSpinner';
import useCreditNoteNotifications from '../hooks/useCreditNoteNotifications';
import { FiInfo } from 'react-icons/fi';

/**
 * Credit Note Configuration Page — Internal App.
 * Allows Admin and Management to configure global credit note rules
 * and area-specific overrides.
 */
export default function CreditNoteConfigPage() {
  const dispatch = useDispatch();
  const { config, areaConfigs, isLoading, error } = useSelector((state) => state.creditNote);
  const notify = useCreditNoteNotifications();

  // ===== Fetch Configuration =====
  const fetchConfig = useCallback(async () => {
    dispatch(fetchConfigStart());
    try {
      const response = await creditNoteService.getConfig();
      dispatch(fetchConfigSuccess(response));
    } catch (err) {
      dispatch(fetchConfigFailure(err?.response?.data?.message || 'Failed to fetch configuration'));
    }
  }, [dispatch]);

  // ===== Fetch Area Configs =====
  const fetchAreaConfigs = useCallback(async () => {
    dispatch(fetchAreaConfigsStart());
    try {
      const response = await creditNoteService.getAreaConfigs();
      dispatch(fetchAreaConfigsSuccess(response));
    } catch (err) {
      dispatch(fetchAreaConfigsFailure(err?.response?.data?.message || 'Failed to fetch area configs'));
    }
  }, [dispatch]);

  // ===== Initial Load =====
  useEffect(() => {
    fetchConfig();
    fetchAreaConfigs();
  }, [fetchConfig, fetchAreaConfigs]);

  // ===== Update Global Config =====
  const handleUpdateConfig = async (newConfig) => {
    dispatch(updateConfigStart());
    try {
      const response = await creditNoteService.updateConfig(newConfig);
      dispatch(updateConfigSuccess(response));
      notify.notifyConfigUpdated();
    } catch (err) {
      dispatch(updateConfigFailure(err?.response?.data?.message || 'Failed to update configuration'));
    }
  };

  // ===== Save Area Config =====
  const handleSaveAreaConfig = async (areaData) => {
    dispatch(upsertAreaConfigStart());
    try {
      const response = await creditNoteService.upsertAreaConfig(areaData);
      dispatch(upsertAreaConfigSuccess(response));
      notify.notifyAreaConfigSaved(areaData.areaCode);
    } catch (err) {
      dispatch(upsertAreaConfigFailure(err?.response?.data?.message || 'Failed to save area config'));
    }
  };

  // ===== Delete Area Config =====
  const handleDeleteAreaConfig = async (areaCode) => {
    if (!window.confirm(`Are you sure you want to delete the configuration for area "${areaCode}"?`)) return;
    dispatch(deleteAreaConfigStart());
    try {
      await creditNoteService.deleteAreaConfig(areaCode);
      dispatch(deleteAreaConfigSuccess(areaCode));
      notify.notifyAreaConfigDeleted(areaCode);
    } catch (err) {
      dispatch(deleteAreaConfigFailure(err?.response?.data?.message || 'Failed to delete area config'));
    }
  };

  // ===== Clear Error =====
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Note Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure credit note rules, expiry windows, and area-specific overrides
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <FiInfo className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-700 font-medium">About Credit Note Configuration</p>
          <p className="text-xs text-blue-600 mt-1">
            These settings control how credit notes work across the system. Area-specific rules override global defaults
            for pharmacies in that area. Changes take effect immediately for new credit note requests.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => dispatch(clearError())} className="text-red-500 hover:text-red-700 text-lg">&times;</button>
        </div>
      )}

      {/* Config Panel */}
      <CreditNoteConfigPanel
        config={config}
        areaConfigs={areaConfigs}
        onUpdateConfig={handleUpdateConfig}
        onSaveAreaConfig={handleSaveAreaConfig}
        onDeleteAreaConfig={handleDeleteAreaConfig}
        isLoading={isLoading}
      />

      {/* Loading Overlay */}
      {isLoading && !config && <PageLoader />}
    </div>
  );
}
