# Credit Note Module - Design Document

## Overview
Complete Credit Note lifecycle management for Medical Wholesale Application across Public App (Pharmacist) and Internal App (Operations Team).

---

## Architecture

### Public App (Pharmacist Portal)
```
src/
  services/creditNoteService.js         # API calls
  redux/slices/creditNoteSlice.js       # State management
  components/CreditNote/
    ReturnTypeSelector.jsx              # Step 1: Select return type
    InvoiceSelector.jsx                 # Select from past invoices
    ProductBatchSelector.jsx            # Step 2: Product & batch selection
    CreditNoteItems.jsx                 # Items table with validation
    CreditNoteForm.jsx                  # Main form orchestrator
    CreditNoteList.jsx                  # My Credit Notes listing
    CreditNoteCard.jsx                  # Individual CN card
    CreditNoteStatusBadge.jsx           # Status display
    CreditNoteUsageHistory.jsx          # Usage tracking
    CreditNoteDetail.jsx                # Full detail view
  pages/CreditNotes.jsx                 # My Credit Notes page
  pages/CreateCreditNote.jsx            # Create/Edit credit note
```

### Internal App (Operations Portal)
```
src/
  services/creditNoteService.js         # Management API calls
  redux/slices/creditNoteSlice.js       # Management state
  components/credit-note/
    CreditNoteDashboard.jsx             # Overview dashboard
    CreditNoteTable.jsx                 # Listing table with filters
    CreditNoteDetailModal.jsx           # Detail + approval modal
    ApprovalActions.jsx                 # Stage 1 & 2 approval UI
    PartialApproval.jsx                 # Partial qty approval
    CreditNoteConfig.jsx                # Configuration panel
    AreaConfigForm.jsx                  # Area-based rules
    UsageTracking.jsx                   # Usage history view
  pages/CreditNoteManagement.jsx        # Main management page
  pages/CreditNoteConfigPage.jsx        # Config page (Admin/Manager)
```

---

## Status Lifecycle

```
DRAFT → PENDING_APPROVAL → APPROVED → READY_TO_PROCESS → PARTIALLY_USED → FULLY_UTILIZED
           ↓                  ↓
        REJECTED          EDIT_REQUESTED / DELETE_REQUESTED
```

### Status Definitions
| Status | Description | Actor |
|--------|-------------|-------|
| DRAFT | Saved but not submitted | Pharmacist |
| PENDING_APPROVAL | Submitted, awaiting review | System |
| APPROVED | Stage 1 approved by operator/manager | Internal Team |
| REJECTED | Rejected with mandatory comment | Internal Team |
| READY_TO_PROCESS | Stage 2 approved by manager/admin | Manager/Admin |
| PARTIALLY_USED | Some amount used in billing | System |
| FULLY_UTILIZED | Entire amount consumed | System |
| EDIT_REQUESTED | Pharmacist requested edit | Pharmacist |
| DELETE_REQUESTED | Pharmacist requested deletion | Pharmacist |

---

## Two-Stage Approval Workflow

### Stage 1: Approval
- **Roles**: Operator, Manager, Admin
- **Actions**: Approve / Reject (with mandatory comment)
- **Supports**: Full approval, partial quantity approval, per-item rejection

### Stage 2: Ready-to-Process
- **Roles**: Manager, Admin only
- **Action**: Mark as Ready-to-Process
- **Effect**: Credit note becomes usable in billing

---

## Validation Rules

1. **Product Validation**: Must exist in past orders for the pharmacist
2. **Batch Validation**: Batch must match purchase history
3. **Quantity Validation**: Return qty ≤ purchased qty of that specific batch
4. **Expiry Rule**: For EXPIRY type, CN must be raised within configurable window (default: 90 days from expiry)
5. **Financial Safety**: Fully utilized CNs are locked (no edit/delete)

---

## Configuration System

### Global Defaults
- `expiryClaimWindow`: 90 (days from expiry date)
- `creditUsageValidity`: 180 (days from Ready-to-Process date)
- `partialApprovalEnabled`: true
- `autoApplyInBilling`: true

### Return Types
- EXPIRY (enabled by default)
- BREAKAGE_DAMAGE (enabled by default)
- GOOD_RETURN (enabled by default)

### Area-Based Overrides
- Each area can override: expiryClaimWindow, creditUsageValidity
- System auto-applies rules based on pharmacist's mapped area

---

## Billing Integration

### Availability Conditions
- Status = READY_TO_PROCESS
- Within validity period (configurable)

### Adjustment Logic
- Bill ≥ Credit → Deduct full credit
- Bill < Credit → Deduct partial, carry forward remaining

### Auto-Suggestion
- When enabled, system suggests applying available credit notes during billing

---

## API Endpoints (Expected Backend)

### Public App
```
GET    /api/credit-notes                    # List pharmacist's CNs
GET    /api/credit-notes/:id                # Get CN details
POST   /api/credit-notes                    # Create draft/submit CN
PUT    /api/credit-notes/:id                # Update draft CN
DELETE /api/credit-notes/:id                # Delete draft CN
POST   /api/credit-notes/:id/submit         # Submit for approval
POST   /api/credit-notes/:id/request-edit   # Request edit
POST   /api/credit-notes/:id/request-delete # Request deletion
GET    /api/credit-notes/config             # Get CN config for area
GET    /api/invoices                        # Get past invoices for product selection
GET    /api/invoices/:id/batches            # Get batches from invoice
GET    /api/products/:id/purchase-batches   # Get all batches for a product
```

### Internal App
```
GET    /api/credit-notes                    # List all CNs (with filters)
GET    /api/credit-notes/:id                # Get CN details (full)
PUT    /api/credit-notes/:id/approve        # Stage 1 approval
PUT    /api/credit-notes/:id/reject         # Reject
PUT    /api/credit-notes/:id/ready-to-process # Stage 2
PUT    /api/credit-notes/:id/handle-edit    # Approve/reject edit request
PUT    /api/credit-notes/:id/handle-delete  # Approve/reject delete request
GET    /api/credit-notes/config             # Get config
PUT    /api/credit-notes/config             # Update config
GET    /api/credit-notes/stats              # Dashboard stats
```

---

## Security Constraints
- No approval for DRAFT status
- Strict batch-level quantity validation
- Prevent expired credit usage (beyond validity period)
- Lock after full utilization
- Complete audit trail for all status changes
- Role-based access for approval stages
