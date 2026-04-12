import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPharmacist, updatePharmacist, deletePharmacist, importPharmacists } from '../../../redux/slices/utilitySlice';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import { FormField, FormSection, FormActions } from '../components/FormFields';
import useForm from '../components/useForm';
import { ConfirmDialog } from '../components/FormModal';
import CsvImportButton from '../components/CsvImportButton';

const emptyForm = {
  id: '',
  pharmacyName: '',
  ownerName: '',
  pharmacistName: '',
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

export default function PharmacistEntry() {
  const dispatch = useDispatch();
  const { pharmacists, areas } = useSelector((state) => state.utility);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { values, errors, handleChange, reset, validate, setValue } = useForm(emptyForm);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Pharmacy Name', accessor: 'pharmacyName' },
    { header: 'Owner', accessor: 'ownerName' },
    { header: 'City', accessor: 'city' },
    { header: 'Mobile', accessor: 'mobile1' },
    { header: 'Drug License', accessor: 'drugLicense1' },
    { header: 'Payment Terms', accessor: 'paymentTerms', render: (row) => (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        {row.paymentTerms}
      </span>
    )},
  ];

  const validationRules = {
    id: { required: true, message: 'Pharmacy ID is required' },
    pharmacyName: { required: true, message: 'Pharmacy Name is required' },
    ownerName: { required: true, message: 'Owner Name is required' },
    city: { required: true, message: 'City is required' },
    mobile1: { required: true, message: 'Mobile number is required' },
    drugLicense1: { required: true, message: 'Drug License is required' },
  };

  const handleAdd = () => {
    setEditingItem(null);
    reset();
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setValue('id', item.id);
    setValue('pharmacyName', item.pharmacyName);
    setValue('ownerName', item.ownerName);
    setValue('pharmacistName', item.pharmacistName);
    setValue('addressLine1', item.addressLine1);
    setValue('addressLine2', item.addressLine2);
    setValue('city', item.city);
    setValue('district', item.district);
    setValue('areaCode', item.areaCode);
    setValue('mobile1', item.mobile1);
    setValue('mobile2', item.mobile2);
    setValue('drugLicense1', item.drugLicense1);
    setValue('drugLicense2', item.drugLicense2);
    setValue('gst', item.gst);
    setValue('paymentTerms', item.paymentTerms);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deletePharmacist(deleteId));
  };

  const handleSave = () => {
    if (!validate(validationRules)) return;

    if (editingItem) {
      dispatch(updatePharmacist(values));
    } else {
      dispatch(addPharmacist(values));
    }
    setModalOpen(false);
    reset();
  };

  const areaOptions = areas.map((a) => ({ value: a.id, label: `${a.name} (${a.city})` }));

  return (
    <div>
      <DataTable
        title="Pharmacist Entry"
        columns={columns}
        data={pharmacists}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        searchPlaceholder="Search pharmacists..."
        addLabel="Add Pharmacist"
        emptyMessage="No pharmacists registered yet."
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Pharmacist' : 'Add Pharmacist'}
        size="lg"
      >
        <div className="space-y-6">
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Pharmacy ID"
                name="id"
                value={values.id}
                onChange={handleChange}
                required
                placeholder="e.g., PH-003"
                disabled={!!editingItem}
                error={errors.id}
              />
              <FormField
                label="Pharmacy Name"
                name="pharmacyName"
                value={values.pharmacyName}
                onChange={handleChange}
                required
                placeholder="e.g., City Medical Store"
                error={errors.pharmacyName}
              />
              <FormField
                label="Owner Name"
                name="ownerName"
                value={values.ownerName}
                onChange={handleChange}
                required
                placeholder="Owner's full name"
                error={errors.ownerName}
              />
              <FormField
                label="Pharmacist Name"
                name="pharmacistName"
                value={values.pharmacistName}
                onChange={handleChange}
                placeholder="Licensed pharmacist"
              />
            </div>
          </FormSection>

          <FormSection title="Address Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Address Line 1"
                name="addressLine1"
                value={values.addressLine1}
                onChange={handleChange}
                placeholder="Street address"
              />
              <FormField
                label="Address Line 2"
                name="addressLine2"
                value={values.addressLine2}
                onChange={handleChange}
                placeholder="Area / landmark"
              />
              <FormField
                label="City"
                name="city"
                value={values.city}
                onChange={handleChange}
                required
                placeholder="City"
                error={errors.city}
              />
              <FormField
                label="District"
                name="district"
                value={values.district}
                onChange={handleChange}
                placeholder="District"
              />
              <FormField
                label="Area Code"
                name="areaCode"
                value={values.areaCode}
                onChange={handleChange}
                type="select"
                options={areaOptions}
              />
            </div>
          </FormSection>

          <FormSection title="Contact & Licensing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Mobile Number 1"
                name="mobile1"
                value={values.mobile1}
                onChange={handleChange}
                required
                placeholder="Primary mobile"
                error={errors.mobile1}
              />
              <FormField
                label="Mobile Number 2"
                name="mobile2"
                value={values.mobile2}
                onChange={handleChange}
                placeholder="Secondary mobile"
              />
              <FormField
                label="Drug License 1"
                name="drugLicense1"
                value={values.drugLicense1}
                onChange={handleChange}
                required
                placeholder="e.g., DL-2024-MH-001"
                error={errors.drugLicense1}
              />
              <FormField
                label="Drug License 2"
                name="drugLicense2"
                value={values.drugLicense2}
                onChange={handleChange}
                placeholder="Optional second license"
              />
              <FormField
                label="GST Number"
                name="gst"
                value={values.gst}
                onChange={handleChange}
                placeholder="e.g., 27AABCM1234A1Z5"
              />
              <FormField
                label="Payment Terms"
                name="paymentTerms"
                value={values.paymentTerms}
                onChange={handleChange}
                type="select"
                options={['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD']}
              />
            </div>
          </FormSection>

          <FormActions
            onCancel={() => setModalOpen(false)}
            onSave={handleSave}
            saveLabel={editingItem ? 'Update Pharmacist' : 'Add Pharmacist'}
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Pharmacist"
        message="Are you sure you want to delete this pharmacist? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />

      <CsvImportButton
        onImport={(data) => dispatch(importPharmacists(data))}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'pharmacyName', header: 'Pharmacy Name' },
          { key: 'ownerName', header: 'Owner' },
          { key: 'city', header: 'City' },
          { key: 'mobile1', header: 'Mobile' },
        ]}
        requiredFields={['id', 'pharmacyName', 'ownerName', 'city', 'mobile1']}
        sampleColumns="id, pharmacy_name, owner_name, pharmacist_name, address_line1, address_line2, city, district, area_code, mobile1, mobile2, drug_license1, drug_license2, gst, payment_terms"
        mapRow={(raw) => ({
          id: raw.id || raw.pharmacy_id || '',
          pharmacyName: raw.pharmacy_name || raw.pharmacyname || '',
          ownerName: raw.owner_name || raw.ownername || '',
          pharmacistName: raw.pharmacist_name || raw.pharmacistname || '',
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
