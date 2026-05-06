# Delivery Dashboard + OTP Verification Module — Backend API Documentation

## Overview

This document describes all backend API endpoints needed for the **Delivery Dashboard + OTP Verification Module**. The system provides real-time delivery tracking for pharmacists (Public App) and OTP-based delivery confirmation for delivery agents (Internal App).

---

## Base URL

- **Internal App API**: `{API_BASE_URL}/api`
- **Public App API**: `{API_BASE_URL}/api`

All endpoints require `Authorization: Bearer <token>` header.

---

## 1. Delivery Tracking APIs (Public App)

### 1.1 Get All Deliveries for Pharmacist

```
GET /api/deliveries
```

**Query Parameters:**

| Parameter | Type   | Default | Description                          |
|-----------|--------|---------|--------------------------------------|
| status    | string | null    | Filter by status (ORDER_PLACED, DISPATCHED, OUT_FOR_DELIVERY, DELIVERED) |
| page      | number | 1       | Page number for pagination            |
| limit     | number | 20      | Items per page                       |

**Response (200):**

```json
{
  "deliveries": [
    {
      "id": "DEL-001",
      "orderId": "ORD-20260413-001",
      "orderDate": "2026-04-13",
      "pharmacy": "Shiv Medical Store",
      "pharmacyId": "PHARM001",
      "deliveryAddress": "Gaddam Plot, Akola, Maharashtra 444001",
      "area": "Gaddam Plot",
      "items": 12,
      "totalAmount": 34500,
      "status": "OUT_FOR_DELIVERY",
      "deliveryPerson": {
        "name": "Rajesh Kumar",
        "phone": "9876543210",
        "vehicle": "Bike - MH-30-AB-1234"
      },
      "dispatchTime": "2026-04-13T10:00:00Z",
      "expectedDeliveryTime": "2026-04-13T16:00:00Z",
      "deliveredTime": null,
      "remarks": "Handle with care",
      "createdAt": "2026-04-13T09:00:00Z",
      "updatedAt": "2026-04-13T11:00:00Z"
    }
  ],
  "total": 6,
  "page": 1
}
```

---

### 1.2 Get Single Delivery by ID

```
GET /api/deliveries/:deliveryId
```

**Response (200):** Same as single delivery object above.

**Error (404):**
```json
{
  "message": "Delivery not found"
}
```

---

### 1.3 Get Delivery Stats

```
GET /api/deliveries/stats
```

**Response (200):**

```json
{
  "total": 6,
  "orderPlaced": 1,
  "dispatched": 1,
  "outForDelivery": 1,
  "delivered": 3
}
```

---

## 2. OTP APIs (Public App — Pharmacist Side)

### 2.1 Get Current OTP

Returns the active OTP for a delivery. OTP is only available for deliveries with status `DISPATCHED` or `OUT_FOR_DELIVERY`.

```
GET /api/deliveries/:deliveryId/otp
```

**Response (200):**

```json
{
  "otp": "482916",
  "expiresAt": "2026-04-13T12:10:00Z",
  "generatedAt": "2026-04-13T12:00:00Z",
  "isExpired": false,
  "regenerationCount": 0,
  "maxRegenerations": 3
}
```

**Error (400):**
```json
{
  "message": "OTP not available – delivery already completed"
}
```

---

### 2.2 Regenerate OTP

Invalidates the old OTP and generates a new one. Subject to max regeneration limit (3).

```
POST /api/deliveries/:deliveryId/otp/regenerate
```

**Response (200):**

```json
{
  "otp": "731504",
  "expiresAt": "2026-04-13T12:15:00Z",
  "generatedAt": "2026-04-13T12:05:00Z",
  "regenerationCount": 1,
  "maxRegenerations": 3
}
```

**Error (400):**
```json
{
  "message": "Maximum OTP regeneration limit (3) reached. Please contact support."
}
```

---

## 3. OTP APIs (Internal App — Delivery Agent Side)

### 3.1 Generate OTP for a Delivery Task

Called when a delivery task status changes to `IN_PROGRESS` (Out for Delivery) or `DISPATCHED`.

```
POST /api/delivery-tasks/:taskId/otp/generate
```

**Response (200):**

```json
{
  "otp": "482916",
  "expiresAt": "2026-04-13T12:10:00Z",
  "regenerationCount": 0,
  "maxRegenerations": 3
}
```

**Note:** The OTP should be automatically sent to the registered pharmacist contact via SMS.

---

### 3.2 Verify OTP

Called by the delivery agent when completing delivery. The agent enters the OTP provided by the pharmacist.

```
POST /api/delivery-tasks/:taskId/otp/verify
```

**Request Body:**

```json
{
  "otp": "482916"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "OTP verified successfully. Delivery marked as complete.",
  "verifiedAt": "2026-04-13T12:05:00Z"
}
```

**Error (400) — Invalid OTP:**
```json
{
  "message": "Invalid OTP. Please check and try again."
}
```

**Error (400) — Expired OTP:**
```json
{
  "message": "OTP has expired. Please regenerate and try again."
}
```

**Error (400) — Already Used:**
```json
{
  "message": "This OTP has already been used. Delivery cannot be verified twice."
}
```

---

### 3.3 Regenerate OTP (Internal App)

Allows the delivery agent to regenerate OTP if needed.

```
POST /api/delivery-tasks/:taskId/otp/regenerate
```

**Response (200):** Same as 3.1.

---

### 3.4 Get OTP Status (Internal App)

Returns the status of OTP for a task **without** revealing the OTP value.

```
GET /api/delivery-tasks/:taskId/otp/status
```

**Response (200):**

```json
{
  "isActive": true,
  "isExpired": false,
  "isUsed": false,
  "expiresAt": "2026-04-13T12:10:00Z",
  "generatedAt": "2026-04-13T12:00:00Z",
  "regenerationCount": 0,
  "maxRegenerations": 3
}
```

---

## 4. OTP Configuration

| Setting                  | Value | Description                              |
|--------------------------|-------|------------------------------------------|
| OTP Length               | 6     | 6-digit numeric code                     |
| OTP Validity             | 10 min | Time-bound validity window              |
| Max Regeneration Count   | 3     | Max times OTP can be regenerated         |
| OTP Single-Use           | Yes   | Once verified, OTP becomes invalid       |

---

## 5. Notification Triggers

### Pharmacist Notifications:
| Event                 | Channel | Message Template                         |
|-----------------------|---------|------------------------------------------|
| Order Dispatched      | Push/SMS | "Your order {orderId} has been dispatched" |
| Out for Delivery      | Push/SMS | "Your order {orderId} is out for delivery. OTP: {otp}" |
| OTP Regenerated       | SMS     | "New OTP for order {orderId}: {otp}"     |
| Delivery Completed    | Push    | "Your order {orderId} has been delivered" |

### Delivery Agent Notifications:
| Event                 | Channel | Message Template                         |
|-----------------------|---------|------------------------------------------|
| Delivery Assigned     | Push    | "New delivery assigned: {orderId}"       |
| OTP Verification Req  | Push    | "Verify OTP to complete delivery {orderId}" |
| Delivery Completed    | Push    | "Delivery {orderId} completed successfully" |

---

## 6. Database Schema (Suggested)

### `delivery_otps` table:

| Column              | Type       | Description                              |
|---------------------|------------|------------------------------------------|
| id                  | UUID/PK    | Primary key                              |
| delivery_task_id    | FK         | Reference to delivery_tasks              |
| order_id            | FK         | Reference to orders                      |
| pharmacy_id         | FK         | Reference to pharmacies                  |
| otp                 | VARCHAR(6) | 6-digit OTP code                         |
| generated_at        | TIMESTAMP  | When OTP was created                     |
| expires_at          | TIMESTAMP  | OTP expiry time                          |
| is_used             | BOOLEAN    | Whether OTP has been verified            |
| used_at             | TIMESTAMP  | When OTP was verified                    |
| regeneration_count  | INT        | Number of times regenerated              |
| created_at          | TIMESTAMP  | Record creation time                     |

---

## 7. Security Considerations

1. **OTP mapping**: OTP is mapped to `delivery_task_id` + `pharmacy_id` to prevent cross-order/cross-pharmacy misuse
2. **Time-bound**: OTP expires after 10 minutes
3. **Single-use**: Once verified, OTP is marked as used and cannot be reused
4. **Rate limiting**: Max 3 regeneration attempts per delivery
5. **OTP delivery**: OTP is sent ONLY to the registered pharmacist contact (via SMS)
6. **Audit trail**: All OTP operations (generate, verify, regenerate) should be logged
