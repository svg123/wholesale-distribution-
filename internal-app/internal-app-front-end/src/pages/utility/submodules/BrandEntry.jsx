import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBrand, updateBrand, deleteBrand, importBrands } from '../../../redux/slices/utilitySlice';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { FormField, FormActions } from '../components/FormFields';
import useForm from '../components/useForm';
import { ConfirmDialog } from '../components/FormModal';
import CsvImportButton from '../components/CsvImportButton';

const BRAND_TYPES = ['ETHICAL', 'GENERIC', 'OTC', 'SURGICAL', 'VETERINARY', 'STANDARD', 'GENERAL'];
const BRAND_CATEGORIES = ['FAST MOVING', 'MOVING', 'NORMAL', 'BELOW AVERAGE'];

const emptyForm = { id: '', name: '', type: '', category: '' };

const typeColors = {
  ETHICAL: 'bg-purple-50 text-purple-700',
  GENERIC: 'bg-blue-50 text-blue-700',
  OTC: 'bg-green-50 text-green-700',
  SURGICAL: 'bg-red-50 text-red-700',
  VETERINARY: 'bg-orange-50 text-orange-700',
  STANDARD: 'bg-gray-50 text-gray-700',
  GENERAL: 'bg-teal-50 text-teal-700',
};

const categoryColors = {
  'FAST MOVING': 'bg-green-50 text-green-700',
  MOVING: 'bg-blue-50 text-blue-700',
  NORMAL: 'bg-yellow-50 text-yellow-700',
  'BELOW AVERAGE': 'bg-red-50 text-red-700',
};

export default function BrandEntry() {
  const dispatch = useDispatch();
  const { brands } = useSelector((state) => state.utility);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { values, errors, handleChange, reset, validate, setValue } = useForm(emptyForm);

  const columns = [
    { header: 'Brand ID', accessor: 'id' },
    { header: 'Brand Name', accessor: 'name' },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[row.type] || 'bg-gray-50 text-gray-700'}`}>
          {row.type}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[row.category] || 'bg-gray-50 text-gray-700'}`}>
          {row.category}
        </span>
      ),
    },
  ];

  const validationRules = {
    id: { required: true, message: 'Brand ID is required' },
    name: { required: true, message: 'Brand Name is required' },
    type: { required: true, message: 'Brand Type is required' },
    category: { required: true, message: 'Brand Category is required' },
  };

  const handleAdd = () => { setEditingItem(null); reset(); setModalOpen(true); };
  const handleEdit = (item) => {
    setEditingItem(item);
    Object.keys(emptyForm).forEach((key) => setValue(key, item[key] || ''));
    setModalOpen(true);
  };
  const handleDeleteClick = (id) => { setDeleteId(id); setConfirmOpen(true); };
  const handleConfirmDelete = () => { dispatch(deleteBrand(deleteId)); };

  const handleSave = () => {
    if (!validate(validationRules)) return;
    if (editingItem) { dispatch(updateBrand(values)); } else { dispatch(addBrand(values)); }
    setModalOpen(false);
    reset();
  };

  return (
    <div>
      <DataTable
        title="Brand Entry"
        columns={columns}
        data={brands}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        searchPlaceholder="Search brands..."
        addLabel="Add Brand"
        emptyMessage="No brands registered yet."
      />

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Brand' : 'Add Brand'} size="sm">
        <div className="space-y-4">
          <FormField label="Brand ID" name="id" value={values.id} onChange={handleChange} required placeholder="e.g., BR-007" disabled={!!editingItem} error={errors.id} />
          <FormField label="Brand Name" name="name" value={values.name} onChange={handleChange} required placeholder="e.g., Pfizer" error={errors.name} />
          <FormField label="Brand Type" name="type" value={values.type} onChange={handleChange} type="select" required options={BRAND_TYPES} error={errors.type} />
          <FormField label="Brand Category" name="category" value={values.category} onChange={handleChange} type="select" required options={BRAND_CATEGORIES} error={errors.category} />
          <FormActions onCancel={() => setModalOpen(false)} onSave={handleSave} saveLabel={editingItem ? 'Update Brand' : 'Add Brand'} />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Brand"
        message="Are you sure? This brand cannot be deleted if it is referenced by existing products."
        confirmLabel="Delete"
        danger
      />

      <CsvImportButton
        onImport={(data) => dispatch(importBrands(data))}
        columns={[
          { key: 'id', header: 'Brand ID' },
          { key: 'name', header: 'Brand Name' },
          { key: 'type', header: 'Type' },
          { key: 'category', header: 'Category' },
        ]}
        requiredFields={['id', 'name', 'type', 'category']}
        sampleColumns="id, name, type, category"
        mapRow={(raw) => ({
          id: raw.id || raw.brand_id || '',
          name: raw.name || raw.brand_name || '',
          type: (raw.type || raw.brand_type || '').toUpperCase(),
          category: (raw.category || raw.brand_category || '').toUpperCase(),
        })}
      />
    </div>
  );
}
