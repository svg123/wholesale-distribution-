import React, { useState, useRef } from 'react';
import FormModal from './FormModal';
import { FormActions } from './FormFields';

/**
 * Reusable CSV Import Button with preview modal.
 *
 * Props:
 *  - onImport(dataArray)       — called with the final validated array
 *  - columns                   — [{ key, header }] for the preview table
 *  - mapRow(rowObject, rowIndex) — transform a raw CSV row into your data shape; return null to skip
 *  - requiredFields            — array of keys that must be non-empty in the mapped row
 *  - sampleColumns             — optional hint string shown when no valid rows found
 */
export default function CsvImportButton({ onImport, columns, mapRow, requiredFields = [], sampleColumns = '' }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileRef = useRef(null);

  // ---------- file handling ----------
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        setPreview([]);
        setErrors(['CSV file is empty or has no data rows.']);
        setModalOpen(true);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
      const parsed = [];
      const errs = [];

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map((v) => v.trim());
        if (vals.length < headers.length) continue;

        const raw = {};
        headers.forEach((h, idx) => {
          raw[h] = vals[idx];
        });

        const mapped = mapRow(raw, i);
        if (!mapped) continue;

        // validate required fields
        const missing = requiredFields.filter((f) => !mapped[f]?.toString().trim());
        if (missing.length > 0) {
          errs.push(`Row ${i + 1}: Missing ${missing.join(', ')}`);
          continue;
        }

        parsed.push(mapped);
      }

      setPreview(parsed);
      setErrors(errs);
      setModalOpen(true);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    onImport(preview);
    setModalOpen(false);
    setPreview([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      {/* Trigger Button */}
      <div className="mt-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import from CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </div>

      {/* Preview Modal */}
      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="CSV Import Preview" size="xl">
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
            <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {preview.length > 0 ? (
          <>
            <p className="text-sm text-gray-600 mb-3">{preview.length} record(s) ready to import.</p>
            <div className="overflow-x-auto max-h-80 border border-gray-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {columns.map((col) => (
                        <td key={col.key} className="px-3 py-1.5">
                          {row[col.key] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <FormActions onCancel={() => setModalOpen(false)} onSave={handleImport} saveLabel={`Import ${preview.length} Record(s)`} />
          </>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            <p>No valid records found in the CSV file.</p>
            {sampleColumns && <p className="mt-1 text-xs text-gray-400">Expected columns: {sampleColumns}</p>}
          </div>
        )}
      </FormModal>
    </>
  );
}
