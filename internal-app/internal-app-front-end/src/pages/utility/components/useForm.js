import { useState, useCallback } from 'react';

/**
 * Custom hook for form handling
 */
export default function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setMultipleValues = useCallback((newValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const validate = useCallback(
    (validationRules) => {
      const newErrors = {};
      Object.entries(validationRules).forEach(([field, rules]) => {
        const value = values[field];
        if (rules.required && !value?.toString().trim()) {
          newErrors[field] = rules.message || `${field} is required`;
        }
        if (rules.pattern && value && !rules.pattern.test(value)) {
          newErrors[field] = rules.patternMessage || `Invalid ${field}`;
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [values]
  );

  return {
    values,
    errors,
    handleChange,
    setValue,
    setMultipleValues,
    reset,
    validate,
    setErrors,
  };
}
