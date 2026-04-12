import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSupplier, updateSupplier, deleteSupplier, importSuppliers } from '../../../redux/slices/utilitySlice';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { FormField, FormSection, FormActions } from '../components/FormFields';
import useForm from '../components/useForm';
import { ConfirmDialog } from '../components/FormModal';
import CsvImportButton from '../components/CsvImportButton';

const emptyForm = {
  id: '',
  supplierName: '',
  contactPerson: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  district: '',
  areaCode: '',
  mobile1: '',
  mobile2: '',
  drugLicense1: '',
  drugLicense2: '',
  gst: '',
  paymentTerms: '',
};

export default function SupplierEntry() {
  const dispatch = useDispatch();
  const { suppliers, areas } = useSelector((state) => state.utility);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { values, errors, handleChange, reset, validate, setValue } = useForm(emptyForm);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Supplier Name', accessor: 'supplierName' },
    { header: 'Contact Person', accessor: 'contactPerson' },
    { header: 'City', accessor: 'city' },
    { header: 'Mobile', accessor: 'mobile1' },
    { header: 'Payment Terms', accessor: 'paymentTerms', render: (row) => (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
        {row.paymentTerms}
      </span>
    )},
  ];

  const validationRules = {
    id: { required: true, message: 'Supplier ID is required' },
    supplierName: { required: true, message: 'Supplier Name is required' },
    contactPerson: { required: true, message: 'Contact Person is required' },
    city: { required: true, message: 'City is required' },
    mobile1: { required: true, message: 'Mobile number is required' },
  };

  const handleAdd = () => {
    setEditingItem(null);
    reset();
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    Object.keys(emptyForm).forEach((key) => setValue(key, item[key] || ''));
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteSupplier(deleteId));
  };

  const handleSave = () => {
    if (!validate(validationRules)) return;
    if (editingItem) {
      dispatch(updateSupplier(values));
    } else {
      dispatch(addSupplier(values));
    }
    setModalOpen(false);
    reset();
  };

  const areaOptions = areas.map((a) => ({ value: a.id, label: `${a.name} (${a.city})` }));

  return (
    <div>
      <DataTable
        title="Supplier Entry"
        columns={columns}
        data={suppliers}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        searchPlaceholder="Search suppliers..."
        addLabel="Add Supplier"
        emptyMessage="No suppliers registered yet."
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Supplier' : 'Add Supplier'}
        size="lg"
      >
        <div className="space-y-6">
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Supplier ID"
                name="id"
                value={values.id}
                onChange={handleChange}
                required
                placeholder="e.g., SUP-003"
                disabled={!!editingItem}
                error={errors.id}
              />
              <FormField
                label="Supplier Name"
                name="supplierName"
                value={values.supplierName}
                onChange={handleChange}
                required
                placeholder="e.g., Sun Pharma Distributors"
                error={errors.supplierName}
              />
              <FormField
                label="Contact Person"
                name="contactPerson"
                value={values.contactPerson}
                onChange={handleChange}
                required
                placeholder="Primary contact person"
                error={errors.contactPerson}
              />
              <FormField
                label="GST Number"
                name="gst"
                value={values.gst}
                onChange={handleChange}
                placeholder="e.g., 27AABCS9012C3Z5"
              />
            </div>
          </FormSection>

          <FormSection title="Address Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Address Line 1" name="addressLine1" value={values.addressLine1} onChange={handleChange} placeholder="Street address" />
              <FormField label="Address Line 2" name="addressLine2" value={values.addressLine2} onChange={handleChange} placeholder="Area / landmark" />
              <FormField label="City" name="city" value={values.city} onChange={handleChange} required placeholder="City" error={errors.city} />
              <FormField label="District" name="district" value={values.district} onChange={handleChange} placeholder="District" />
              <FormField label="Area Code" name="areaCode" value={values.areaCode} onChange={handleChange} type="select" options={areaOptions} />
            </div>
          </FormSection>

          <FormSection title="Contact & Licensing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Mobile Number 1" name="mobile1" value={values.mobile1} onChange={handleChange} required placeholder="Primary mobile" error={errors.mobile1} />
              <FormField label="Mobile Number 2" name="mobile2" value={values.mobile2} onChange={handleChange} placeholder="Secondary mobile" />
              <FormField label="Drug License 1" name="drugLicense1" value={values.drugLicense1} onChange={handleChange} placeholder="e.g., DL-2024-SUP-001" />
              <FormField label="Drug License 2" name="drugLicense2" value={values.drugLicense2} onChange={handleChange} placeholder="Optional second license" />
              <FormField label="Payment Terms" name="paymentTerms" value={values.paymentTerms} onChange={handleChange} type="select" options={['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD']} />
            </div>
          </FormSection>

          <FormActions onCancel={() => setModalOpen(false)} onSave={handleSave} saveLabel={editingItem ? 'Update Supplier' : 'Add Supplier'} />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />

      <CsvImportButton
        onImport={(data) => dispatch(importSuppliers(data))}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'supplierName', header: 'Supplier Name' },
          { key: 'contactPerson', header: 'Contact Person' },
          { key: 'city', header: 'City' },
          { key: 'mobile1', header: 'Mobile' },
        ]}
        requiredFields={['id', 'supplierName', 'contactPerson', 'city', 'mobile1']}
        sampleColumns="id, supplier_name, contact_person, address_line1, address_line2, city, district, area_code, mobile1, mobile2, drug_license1, drug_license2, gst, payment_terms"
        mapRow={(raw) => ({
          id: raw.id || raw.supplier_id || '',
          supplierName: raw.supplier_name || raw.suppliername || '',
          contactPerson: raw.contact_person || raw.contactperson || '',
          addressLine1: raw.address_line1 || raw.addressline1 || '',
          addressLine2: raw.address_line2 || raw.addressline2 || '',
          city: raw.city || '',
          district: raw.district || '',
          areaCode: raw.area_code || raw.areacode || '',
          mobile1: raw.mobile1 || raw.mobile_1 || '',
          mobile2: raw.mobile2 || raw.mobile_2 || '',
          drugLicense1: raw.drug_license1 || raw.druglicense1 || '',
          drugLicense2: raw.drug_license2 || raw.druglicense2 || '',
          gst: raw.gst || '',
          paymentTerms: raw.payment_terms || raw.paymentterms || '',
        })}
      />
    </div>
  );
}
