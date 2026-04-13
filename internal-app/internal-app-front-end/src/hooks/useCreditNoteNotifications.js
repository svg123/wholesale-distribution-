import { useDispatch } from 'react-redux';
import { addNotification } from '../redux/slices/uiSlice';

/**
 * Custom hook for dispatching credit note notifications.
 * Provides helpers for common credit note events.
 */
export default function useCreditNoteNotifications() {
  const dispatch = useDispatch();

  const notify = (type, message) => {
    dispatch(addNotification({ type, message }));
  };

  return {
    /** Credit note approved */
    notifyApproved: (creditNoteId) =>
      notify('success', `Credit note ${creditNoteId} has been approved.`),

    /** Credit note rejected */
    notifyRejected: (creditNoteId) =>
      notify('error', `Credit note ${creditNoteId} has been rejected.`),

    /** Credit note marked ready-to-process */
    notifyReadyToProcess: (creditNoteId) =>
      notify('success', `Credit note ${creditNoteId} is now ready to process in billing.`),

    /** Credit note edit request approved */
    notifyEditApproved: (creditNoteId) =>
      notify('success', `Edit request for ${creditNoteId} has been approved. Pharmacy can now edit.`),

    /** Credit note edit request rejected */
    notifyEditRejected: (creditNoteId) =>
      notify('warning', `Edit request for ${creditNoteId} has been rejected.`),

    /** Credit note delete request approved */
    notifyDeleteApproved: (creditNoteId) =>
      notify('info', `Delete request for ${creditNoteId} has been approved. Credit note removed.`),

    /** Credit note delete request rejected */
    notifyDeleteRejected: (creditNoteId) =>
      notify('warning', `Delete request for ${creditNoteId} has been rejected.`),

    /** Config updated */
    notifyConfigUpdated: () =>
      notify('success', 'Credit note configuration has been updated.'),

    /** Area config saved */
    notifyAreaConfigSaved: (areaCode) =>
      notify('success', `Area configuration for ${areaCode} has been saved.`),

    /** Area config deleted */
    notifyAreaConfigDeleted: (areaCode) =>
      notify('info', `Area configuration for ${areaCode} has been removed.`),

    /** Generic error */
    notifyError: (message) =>
      notify('error', message),

    /** Generic success */
    notifySuccess: (message) =>
      notify('success', message),
  };
}
