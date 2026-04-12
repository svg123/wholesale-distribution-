import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addArea, updateArea, deleteArea, importAreas } from '../../../redux/slices/utilitySlice';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { FormField, FormSection, FormActions } from '../components/FormFields';
import useForm from '../components/useForm';
import { ConfirmDialog } from '../components/FormModal';
import CsvImportButton from '../components/CsvImportButton';

const emptyForm = {
  id: '',
  name: '',
  city: '',
  priority: '',
  subArea: '',
  grade: '',
};

const gradeColors = {
  A: 'bg-green-50 text-green-700',
  B: 'bg-blue-50 text-blue-700',
  C: 'bg-yellow-50 text-yellow-700',
  D: 'bg-red-50 text-red-700',
};

export default function AreaEntry() {
  const dispatch = useDispatch();
  const { areas } = useSelector((state) => state.utility);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { values, errors, handleChange, reset, validate, setValue } = useForm(emptyForm);

  const columns = [
    { header: 'Area Code', accessor: 'id' },
    { header: 'Area Name', accessor: 'name' },
    { header: 'City', accessor: 'city' },
    { header: 'Priority', accessor: 'priority', render: (row) => (
      <span className="inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold bg-primary-50 text-primary-700">
        {row.priority}
      </span>
    )},
    { header: 'Sub Area', accessor: 'subArea', render: (row) => row.subArea || <span className="text-xs text-gray-400">—</span> },
    { header: 'Grade', accessor: 'grade', render: (row) => (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${gradeColors[row.grade] || 'bg-gray-50 text-gray-700'}`}>
        {row.grade}
      </span>
    )},
  ];

  const validationRules = {
    name: { required: true, message: 'Area Name is required' },
    city: { required: true, message: 'City is required' },
    priority: { required: true, message: 'Priority is required' },
    grade: { required: true, message: 'Grade is required' },
  };

  const handleAdd = () => {
    setEditingItem(null);
    reset();
    // Auto-generate area code ID
    const nextId = `AREA-${String(areas.length + 1).padStart(3, '0')}`;
    setValue('id', nextId);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    Object.keys(emptyForm).forEach((key) => setValue(key, item[key] || ''));
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => { setDeleteId(id); setConfirmOpen(true); };
  const handleConfirmDelete = () => { dispatch(deleteArea(deleteId)); };

  const handleSave = () => {
    if (!validate(validationRules)) return;

    const payload = {
      ...values,
      priority: Number(values.priority),
    };

    if (editingItem) { dispatch(updateArea(payload)); } else { dispatch(addArea(payload)); }
    setModalOpen(false);
    reset();
  };

  return (
    <div>
      <DataTable
        title="Area Structure Entry"
        columns={columns}
        data={areas}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        searchPlaceholder="Search areas..."
        addLabel="New Area Code"
        emptyMessage="No areas defined yet."
      />

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Area Code' : 'New Area Code'} size="sm">
        <div className="space-y-6">
          <FormSection title="Area Details">
            <FormField
              label="Area Code ID"
              name="id"
              value={values.id}
              onChange={handleChange}
              disabled
              hint="Auto-generated"
            />
            <FormField
              label="Area Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              placeholder="e.g., Andheri West"
              error={errors.name}
            />
            <FormField
              label="City"
              name="city"
              value={values.city}
              onChange={handleChange}
              required
              placeholder="e.g., Mumbai"
              error={errors.city}
            />
            <FormField
              label="Priority"
              name="priority"
              value={values.priority}
              onChange={handleChange}
              type="number"
              required
              placeholder="e.g., 1 (highest)"
              error={errors.priority}
            />
            <FormField
              label="Sub Area"
              name="subArea"
              value={values.subArea}
              onChange={handleChange}
              placeholder="e.g., Lokhandwala"
            />
            <FormField
              label="Area Grade"
              name="grade"
              value={values.grade}
              onChange={handleChange}
              type="select"
              required
              options={['A', 'B', 'C', 'D'].map((g) => ({ value: g, label: `Grade ${g}` }))}
              error={errors.grade}
            />
          </FormSection>

          <FormActions onCancel={() => setModalOpen(false)} onSave={handleSave} saveLabel={editingItem ? 'Update Area' : 'Save Area'} />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Area"
        message="Are you sure? This area cannot be deleted if it is referenced by pharmacies or suppliers."
        confirmLabel="Delete"
        danger
      />

      <CsvImportButton
        onImport={(data) => dispatch(importAreas(data))}
        columns={[
          { key: 'id', header: 'Area Code' },
          { key: 'name', header: 'Area Name' },
          { key: 'city', header: 'City' },
          { key: 'priority', header: 'Priority' },
          { key: 'grade', header: 'Grade' },
        ]}
        requiredFields={['name', 'city', 'priority', 'grade']}
        sampleColumns="id, name, city, priority, sub_area, grade"
        mapRow={(raw) => ({
          id: raw.id || raw.area_code || raw.areacode || `AREA-${String(areas.length + 1).padStart(3, '0')}`,
          name: raw.name || raw.area_name || '',
          city: raw.city || '',
          priority: Number(raw.priority || 0),
          subArea: raw.sub_area || raw.subarea || '',
          grade: (raw.grade || '').toUpperCase(),
        })}
      />
    </div>
  );
}
