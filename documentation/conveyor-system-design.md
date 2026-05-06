# Conveyor Belt Order Fulfillment System — System Design Document

> **Version:** 1.0  
> **Date:** April 13, 2026  
> **Module:** Conveyor Controller + Conveyor Configuration  
> **App:** Internal App (Wholesale Distribution Management)  
> **Author:** System Architecture Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Physical System Overview](#2-physical-system-overview)
3. [System Architecture](#3-system-architecture)
4. [Data Models](#4-data-models)
5. [Order Lifecycle on Conveyor](#5-order-lifecycle-on-conveyor)
6. [Queue Management Algorithm](#6-queue-management-algorithm)
7. [Barcode Scanning Flow](#7-barcode-scanning-flow)
8. [Frontend Module Design](#8-frontend-module-design)
9. [Redux State Management](#9-redux-state-management)
10. [WebSocket Real-Time Events](#10-websocket-real-time-events)
11. [API Design](#11-api-design)
12. [Component Hierarchy](#12-component-hierarchy)
13. [Conveyor Configuration Module](#13-conveyor-configuration-module)
14. [Conveyor Controller Module](#14-conveyor-controller-module)
15. [Integration with Existing Modules](#15-integration-with-existing-modules)
16. [UI/UX Wireframe Descriptions](#16-uiux-wireframe-descriptions)
17. [Error Handling & Edge Cases](#17-error-handling--edge-cases)
18. [Security Considerations](#18-security-considerations)
19. [Performance Considerations](#19-performance-considerations)
20. [Implementation Phases](#20-implementation-phases)

---

## 1. Executive Summary

### Problem Statement

The wholesale pharmaceutical distribution warehouse uses a **main conveyor belt** that runs across the entire facility. When a pharmacist places an order and work begins on it, a barcode is generated and attached to the carton box. The carton travels along the main conveyor belt and passes by multiple **sub-stations** (each representing a pharmaceutical company's product section).

At each sub-station, the barcode is scanned. If the order contains products from that sub-station's company, the carton is diverted from the main conveyor into the sub-station's **side queue**. The sub-station staff fills their portion of the order, then the carton returns to the main conveyor to continue to the next sub-station.

### Key Constraints

| Constraint | Value | Notes |
|---|---|---|
| **Max Queue Size** | 8 orders per sub-station | Hard limit — conveyor must not divert if queue is full |
| **Queue Display Limit** | 7 orders in UI | 8th slot reserved as buffer/processing indicator |
| **Barcode Format** | CODE128 | Encodes order ID, item list, destination sub-stations |
| **Scanning Method** | Barcode scanner at each sub-station | Hardware integration via WebSocket/Serial API |
| **Conveyor Direction** | Unidirectional (start → end) | Orders travel in one direction along main belt |

### System Modules to Build

1. **Conveyor Controller** (`/conveyor-controller`) — Real-time monitoring, queue management, scanning interface
2. **Conveyor Configuration** (`/conveyor-config`) — Admin settings for sub-stations, queue limits, routing rules, speed

---

## 2. Physical System Overview

### 2.1 Warehouse Layout (Conceptual)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MAIN CONVEYOR BELT (→)                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │ ORDER  │  │ ORDER  │  │ ORDER  │  │ ORDER  │  │ ORDER  │          │
│  │ ENTRY  │  │  ...   │  │  ...   │  │  ...   │  │  ...   │          │
│  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘          │
│      │           │           │           │           │                │
│      ▼           ▼           ▼           ▼           ▼                │
│  ═════════════════════════════════════════════════════════════►       │
│      │           │           │           │           │                │
│  ┌───┴────┐  ┌───┴────┐  ┌───┴────┐  ┌───┴────┐  ┌───┴────┐          │
│  │ SCAN   │  │ SCAN   │  │ SCAN   │  │ SCAN   │  │ SCAN   │          │
│  │ ZONE A │  │ ZONE A │  │ ZONE B │  │ ZONE C │  │ ZONE D │          │
│  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘          │
│      │           │           │           │           │                │
│  ┌───┴────┐  ┌───┴────┐  ┌───┴────┐  ┌───┴────┐  ┌───┴────┐          │
│  │SUB-STN │  │SUB-STN │  │SUB-STN │  │SUB-STN │  │SUB-STN │          │
│  │ABBOTT  │  │MANKIND │  │CIPLA   │  │SUN     │  │DR.REDDY│          │
│  │Queue:8 │  │Queue:8 │  │Queue:8 │  │Queue:8 │  │Queue:8 │          │
│  │[7/8]   │  │[3/8]   │  │[5/8]   │  │[1/8]   │  │[0/8]   │          │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘          │
│                                                                         │
│  ═════════════════════════════════════════════════════════════►       │
│                         DISPATCH / PACKING ZONE                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Sub-Station Queue Detail

```
┌──────────────────────────────────┐
│     SUB-STATION: ABBOTT PHARMA   │
│     Zone A - Station 1           │
├──────────────────────────────────┤
│  MAIN CONVEYOR ════════►        │
│         │    ▲                  │
│         ▼    │                  │
│  ┌──────────────────────┐       │
│  │    SIDE QUEUE (→)     │       │
│  │  ┌────┬────┬────┐    │       │
│  │  │ Q1 │ Q2 │ Q3 │    │       │
│  │  ├────┼────┼────┤    │       │
│  │  │ Q4 │ Q5 │ Q6 │    │       │
│  │  ├────┼────┼────┤    │       │
│  │  │ Q7 │ Q8 │    │    │       │
│  │  └────┴────┴────┘    │       │
│  │  Processing: ORD-005 │       │
│  └──────────────────────┘       │
│         │    ▲                  │
│         ▼    │                  │
│  RETURN TO MAIN CONVEYOR ══►   │
└──────────────────────────────────┘
```

### 2.3 Existing Sub-Stations (from `constants.js`)

| Station ID | Company | Zone | Status |
|---|---|---|---|
| STN-ABBOTT | Abbott Pharma | Zone A - Station 1 | ACTIVE |
| STN-MANKIND | Mankind Pharma | Zone A - Station 2 | ACTIVE |
| STN-CIPLA | Cipla | Zone B - Station 1 | ACTIVE |
| STN-LUPIN | Lupin | Zone B - Station 2 | ACTIVE |
| STN-SUN | Sun Pharma | Zone C - Station 1 | ACTIVE |
| STN-ZYDUS | Zydus Cadila | Zone C - Station 2 | ACTIVE |
| STN-DRREDDY | Dr. Reddy's | Zone D - Station 1 | IDLE |
| STN-AJANTA | Ajanta Pharma | Zone D - Station 2 | ACTIVE |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Conveyor         │  │  Conveyor         │  │ Sub-Station   │  │
│  │  Controller       │  │  Configuration    │  │ Status Page   │  │
│  │  (Live Dashboard) │  │  (Admin Settings) │  │ (Enhanced)    │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬────────┘  │
│           │                     │                     │           │
│  ┌────────┴─────────────────────┴─────────────────────┴────────┐  │
│  │                    Redux Store                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │ conveyorSlice│  │ substation   │  │ barcodeSlice     │  │  │
│  │  │              │  │ Slice (exist)│  │ (enhanced)       │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │  │
│  └────────┬─────────────────────┬─────────────────────┬───────┘  │
│           │                     │                     │           │
│  ┌────────┴─────────────────────┴─────────────────────┴────────┐  │
│  │              Services Layer                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │ conveyor     │  │ substation   │  │ barcode          │  │  │
│  │  │ Service (NEW)│  │ Service(ex)  │  │ Service (exist)  │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                    │                     │
              REST API              WebSocket (Socket.io)
                    │                     │
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │ Conveyor     │  │ Barcode      │  │ Order            │       │
│  │ Controller   │  │ Scanner      │  │ Service          │       │
│  │ Service      │  │ Service      │  │                  │       │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘       │
│         │                  │                    │                │
│  ┌──────┴──────────────────┴────────────────────┴───────────┐    │
│  │                    Database (PostgreSQL)                   │    │
│  │  orders | conveyor_queues | barcode_scans | substations   │    │
│  └───────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Communication Flow

```
Pharmacist places order
        │
        ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Order Created │────►│ Work Begins  │────►│ Barcode      │
│ (existing)    │     │ (existing)   │     │ Generated    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                                 ▼
                                         ┌──────────────┐
                                         │ Carton on    │
                                         │ Main Conveyor│
                                         └──────┬───────┘
                                                 │
                        ┌────────────────────────┤
                        ▼                        ▼
                ┌──────────────┐         ┌──────────────┐
                │ Scanned at   │         │ Scanned at   │
                │ Sub-Station A│         │ Sub-Station B│
                │ (has items)  │         │ (no items)   │
                └──────┬───────┘         └──────────────┘
                       │
                       ▼
                ┌──────────────┐
                │ Divert to    │
                │ Queue A      │
                │ [if < 8]     │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Fill products│
                │ Mark done    │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Return to    │
                │ Main Conveyor│
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ All sub-stns │
                │ processed?   │
                └──────┬───────┘
                  Yes/ │  \No
                       ▼    └──► Continue on conveyor
                ┌──────────────┐
                │ Order Ready  │
                │ for Dispatch │
                └──────────────┘
```

---

## 4. Data Models

### 4.1 Conveyor Order (Order on Conveyor)

```typescript
interface ConveyorOrder {
  id: string;                    // e.g., "CO-20260413-001"
  orderId: string;               // Reference to main order, e.g., "ORD-20260413-001"
  barcode: string;               // Barcode value (CODE128 encoded)
  barcodeId: string;             // Reference to barcode record
  
  // Order Info
  pharmacyId: string;            // Which pharmacy ordered
  pharmacyName: string;
  totalItems: number;            // Total items across all products
  totalAmount: number;
  
  // Conveyor State
  status: ConveyorOrderStatus;   // See enum below
  currentPosition: string;       // "MAIN_CONVEYOR" | sub-station ID
  currentZone: string;           // "ZONE_A" | "ZONE_B" etc.
  conveyorEntryTime: string;     // ISO timestamp
  
  // Sub-Station Tracking
  requiredSubStations: string[]; // ["STN-ABBOTT", "STN-CIPLA", "STN-SUN"]
  completedSubStations: string[];// ["STN-ABBOTT"] (already processed)
  remainingSubStations: string[];// ["STN-CIPLA", "STN-SUN"] (pending)
  
  // Product breakdown per sub-station
  subStationItems: {
    [subStationId: string]: {
      items: OrderItem[];
      totalItems: number;
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      startedAt?: string;
      completedAt?: string;
    };
  };
  
  // Priority
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

enum ConveyorOrderStatus {
  ON_MAIN_CONVEYOR = 'ON_MAIN_CONVEYOR',       // Traveling on main belt
  DIVERTING = 'DIVERTING',                       // Being diverted to sub-station
  IN_QUEUE = 'IN_QUEUE',                         // Waiting in sub-station queue
  PROCESSING = 'PROCESSING',                     // Being processed at sub-station
  RETURNING = 'RETURNING',                       // Returning to main conveyor
  COMPLETED = 'COMPLETED',                       // All sub-stations done, ready for dispatch
  BLOCKED = 'BLOCKED',                           // Queue full at next required sub-station
}
```

### 4.2 Sub-Station Queue

```typescript
interface SubStationQueue {
  id: string;                      // e.g., "Q-STN-ABBOTT"
  subStationId: string;            // "STN-ABBOTT"
  
  // Queue State
  maxSize: number;                 // Default: 8
  currentSize: number;             // Current orders in queue (0-8)
  isFull: boolean;                 // currentSize >= maxSize
  
  // Queue Contents (ordered array)
  orders: QueueEntry[];            // FIFO order
  
  // Currently Processing
  processingOrder: ConveyorOrder | null;
  
  // Stats
  totalProcessedToday: number;
  avgProcessingTime: number;       // in minutes
  totalProcessedAllTime: number;
  
  // Status
  status: 'ACTIVE' | 'PAUSED' | 'OFFLINE' | 'MAINTENANCE';
  
  // Conveyor connection status
  conveyorConnected: boolean;
  
  // Timestamps
  lastActivityAt: string;
  updatedAt: string;
}

interface QueueEntry {
  position: number;                // 1 to maxSize
  conveyorOrder: ConveyorOrder;
  queuedAt: string;                // When it entered the queue
  estimatedProcessTime: number;    // in minutes (based on item count)
  status: 'WAITING' | 'PROCESSING' | 'DONE';
  startedProcessingAt?: string;
  completedAt?: string;
}
```

### 4.3 Barcode Scan Event

```typescript
interface BarcodeScanEvent {
  id: string;                      // Unique scan event ID
  barcode: string;                 // Scanned barcode value
  scannedBy: string;               // User/station that scanned
  scannedAt: string;               // ISO timestamp
  subStationId: string;            // Which sub-station scanned it
  
  // Scan Result
  orderFound: boolean;             // Was this a valid order barcode?
  conveyorOrder?: ConveyorOrder;   // Order details if found
  
  // Routing Decision
  hasRelevantItems: boolean;       // Does this order have items for this sub-station?
  diversionDecision: 'DIVERT' | 'PASS_THROUGH' | 'QUEUE_FULL' | 'ALREADY_PROCESSED';
  
  // Queue Status at time of scan
  queueStatus?: {
    currentSize: number;
    maxSize: number;
    isFull: boolean;
  };
}
```

### 4.4 Conveyor Configuration

```typescript
interface ConveyorConfig {
  id: string;
  
  // Global Settings
  conveyorSpeed: 'SLOW' | 'NORMAL' | 'FAST';  // Affects estimated times
  isRunning: boolean;                          // Master on/off
  autoDivert: boolean;                         // Auto-divert or manual confirm
  
  // Queue Defaults
  defaultMaxQueueSize: number;                 // Default: 8
  allowOverflow: boolean;                      // Allow >8 in emergency
  overflowMaxSize: number;                     // Default: 10
  
  // Scanning Settings
  requireScanConfirm: boolean;                 // Require operator to confirm diversion
  autoReturnAfterProcess: boolean;             // Auto-return to conveyor after done
  scanTimeout: number;                         // Seconds before scan expires
  
  // Priority Rules
  priorityRouting: boolean;                    // HIGH priority orders skip queue?
  priorityMaxSkip: number;                     // Max positions to skip (default: 2)
  
  // Zones Configuration
  zones: ConveyorZone[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface ConveyorZone {
  zoneId: string;                // "ZONE_A"
  name: string;                  // "Zone A"
  position: number;              // Physical position along conveyor (1, 2, 3...)
  subStations: string[];         // Sub-station IDs in this zone
  isActive: boolean;
}
```

---

## 5. Order Lifecycle on Conveyor

### 5.1 State Machine

```
                    ┌─────────────────────┐
                    │   ORDER CREATED &   │
                    │   BARCODE GENERATED │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
         ┌────────►│  ON_MAIN_CONVEYOR   │◄──────────┐
         │         │  (Traveling on belt) │            │
         │         └──────────┬──────────┘            │
         │                    │                        │
         │              Scan at Sub-Station           │
         │                    │                        │
         │         ┌──────────┴──────────┐            │
         │         │                     │            │
         │    Has items?            No items        │
         │    for this            or already        │
         │    sub-station?        processed?        │
         │         │                     │            │
         │         ▼                     │            │
         │  ┌─────────────┐              │            │
         │  │  DIVERTING  │              │            │
         │  │(Moving to   │              │            │
         │  │ side queue) │              │            │
         │  └──────┬──────┘              │            │
         │         │                     │            │
         │    Queue full?               │            │
         │    ┌────┴────┐               │            │
         │   No         Yes             │            │
         │    │         │               │            │
         │    ▼         ▼               │            │
         │ ┌──────┐ ┌────────┐          │            │
         │ │IN    │ │BLOCKED │──────────┘            │
         │ │QUEUE │ │(wait   │  (retry when          │
         │ │      │ │ space) │   queue has space)     │
         │ └──┬───┘ └────────┘                       │
         │    │                                       │
         │ Queue position reached                     │
         │    │                                       │
         │    ▼                                       │
         │ ┌─────────────┐                            │
         │ │ PROCESSING  │                            │
         │ │(Staff fills │                            │
         │ │ products)   │                            │
         │ └──────┬──────┘                            │
         │        │                                   │
         │   Done? │                                   │
         │        ▼                                   │
         │ ┌─────────────┐                            │
         │ │ RETURNING   │                            │
         │ │(Back to     │───────────────────────────┘
         │ │ main belt)  │
         │ └──────┬──────┘
         │        │
         │  All sub-stations
         │  completed?
         │   No ─┘
         │   Yes
         │        │
         │        ▼
         │ ┌─────────────┐
         └─│  COMPLETED  │
           │(Ready for   │
           │ dispatch)   │
           └─────────────┘
```

### 5.2 Status Descriptions

| Status | Description | Color Code |
|---|---|---|
| `ON_MAIN_CONVEYOR` | Order carton is traveling on the main belt | Blue |
| `DIVERTING` | Carton is being diverted from main belt to sub-station queue | Yellow |
| `IN_QUEUE` | Carton is waiting in sub-station queue for processing | Orange |
| `PROCESSING` | Sub-station staff is actively filling products | Purple |
| `RETURNING` | Carton is returning from sub-station to main belt | Teal |
| `COMPLETED` | All sub-stations processed, ready for dispatch/packing | Green |
| `BLOCKED` | Cannot divert — destination sub-station queue is full | Red |

---

## 6. Queue Management Algorithm

### 6.1 Diversion Decision Logic

```python
def should_divert_to_substation(order, substation_queue, config):
    """
    Determines if an order should be diverted from main conveyor 
    to a specific sub-station's queue.
    """
    # 1. Check if order has items for this sub-station
    if substation_queue.id not in order.requiredSubStations:
        return PASS_THROUGH
    
    # 2. Check if already processed at this sub-station
    if substation_queue.id in order.completedSubStations:
        return ALREADY_PROCESSED
    
    # 3. Check if sub-station is active
    if substation_queue.status != 'ACTIVE':
        return SUBSTATION_INACTIVE
    
    # 4. Check queue capacity
    if substation_queue.currentSize >= substation_queue.maxSize:
        if config.allowOverflow and substation_queue.currentSize < config.overflowMaxSize:
            return DIVERT_OVERFLOW  # Divert but flag as overflow
        return QUEUE_FULL  # BLOCKED — order stays on main conveyor
    
    # 5. Priority check (HIGH priority can skip queue)
    if order.priority == 'HIGH' and config.priorityRouting:
        return DIVERT_PRIORITY
    
    # 6. Normal diversion
    return DIVERT_NORMAL
```

### 6.2 Queue Position Assignment

```python
def assign_queue_position(order, queue):
    """
    Assigns the next available position in the queue.
    Positions are 1-8 (maxSize).
    """
    # Find first empty position
    occupied_positions = {entry.position for entry in queue.orders}
    
    for pos in range(1, queue.maxSize + 1):
        if pos not in occupied_positions:
            return pos
    
    return None  # Queue is full
```

### 6.3 Auto-Return Logic

```python
def process_queue_entry(queue_entry, config):
    """
    Called when sub-station marks an order as done.
    Handles returning the order to the main conveyor.
    """
    order = queue_entry.conveyorOrder
    
    # Mark sub-station as completed for this order
    order.completedSubStations.append(queue_entry.subStationId)
    order.remainingSubStations.remove(queue_entry.subStationId)
    
    # Check if ALL required sub-stations are done
    if len(order.remainingSubStations) == 0:
        order.status = 'COMPLETED'
        # Route to dispatch/packing zone
    else:
        order.status = 'RETURNING'
        # Return to main conveyor to reach next sub-station
    
    # Remove from queue, free up position
    queue.orders.remove(queue_entry)
    queue.currentSize -= 1
    
    # Move next waiting order to processing
    next_waiting = next(
        (e for e in queue.orders if e.status == 'WAITING'),
        None
    )
    if next_waiting:
        next_waiting.status = 'PROCESSING'
        next_waiting.startedProcessingAt = now()
        queue.processingOrder = next_waiting.conveyorOrder
    
    # Check if any BLOCKED orders can now be diverted
    check_blocked_orders(order, queue)
```

---

## 7. Barcode Scanning Flow

### 7.1 Barcode Data Structure

The barcode (CODE128 format) encodes the following data:

```
┌─────────────────────────────────────────────────────┐
│  BARCODE VALUE: ORD-20260413-001|STN-ABBOTT,CIPLA,SUN|12|34500  │
│                     │                │    │     │              │
│                     │                │    │     └─ Total Amount│
│                     │                │    └─────── Total Items│
│                     │                └──────── Required Sub-Stations
│                     └────────────────────────── Order ID
└─────────────────────────────────────────────────────┘

Format: {ORDER_ID}|{SUB_STATIONS_CSV}|{TOTAL_ITEMS}|{TOTAL_AMOUNT}
Example: ORD-20260413-001|STN-ABBOTT,STN-CIPLA,STN-SUN|12|34500
```

### 7.2 Scanning Flow (Per Sub-Station)

```
┌─────────────────────────────────────────────────────┐
│              BARCODE SCANNED AT SUB-STATION          │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Decode       │
              │  Barcode Data │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │  Lookup Order │
              │  in System    │
              └───────┬───────┘
                      │
              ┌───────┴───────┐
              │               │
          Found?          Not Found
              │               │
              ▼               ▼
      ┌──────────────┐ ┌──────────────┐
      │  Check if    │ │  Show Error  │
      │  order has   │ │  "Unknown    │
      │  items for   │ │  Barcode"    │
      │  this station│ └──────────────┘
      └──────┬───────┘
              │
        ┌─────┴─────┐
        │           │
     Has items   No items / 
     for this     Already 
     station?     processed
        │           │
        ▼           ▼
  ┌──────────┐ ┌──────────┐
  │ Check    │ │ Show     │
  │ Queue    │ │ "No      │
  │ Capacity │ │ Action   │
  └────┬─────┘ │ Needed"  │
       │       └──────────┘
  ┌────┴────┐
  │         │
Queue     Queue
has       is
space     FULL
  │         │
  ▼         ▼
┌──────┐ ┌──────────┐
│Add to│ │ Show     │
│Queue │ │ "Queue   │
│      │ │ Full"    │
└──────┘ │ + Block  │
         │ alert    │
         └──────────┘
```

### 7.3 Scanner Hardware Integration

```typescript
// Barcode scanner listens on a serial port or USB HID
// The scanner acts as a keyboard input — types the barcode and presses Enter

interface ScannerConfig {
  subStationId: string;
  scannerId: string;
  inputMode: 'KEYBOARD_EMULATION' | 'SERIAL' | 'USB_HID';
  baudRate?: number;              // For serial mode
  debounceMs: number;             // Prevent double-scans (default: 500ms)
  prefix?: string;                // Optional prefix to strip
  suffix?: string;                // Usually '\r' or '\n'
}
```

---

## 8. Frontend Module Design

### 8.1 New Pages

| Page | Route | Description | Access |
|---|---|---|---|
| Conveyor Controller | `/conveyor-controller` | Real-time conveyor dashboard with live queue visualization | STAFF, MANAGEMENT, ADMIN |
| Conveyor Configuration | `/conveyor-config` | Admin settings for conveyor system | MANAGEMENT, ADMIN |

### 8.2 Enhanced Existing Pages

| Page | Enhancement | Description |
|---|---|---|
| Sub-Station Status | Queue Display | Show queue count (X/8) and queue contents for each sub-station |
| Barcode Generator | Auto-Queue Link | After barcode generation, order auto-enters conveyor system |

### 8.3 New Components

```
src/components/conveyor/
├── ConveyorOverview.jsx           // Main conveyor visualization (animated)
├── ConveyorLane.jsx               // Main conveyor belt visual strip
├── SubStationNode.jsx             // Individual sub-station on the conveyor map
├── QueueVisualization.jsx         // Visual queue display (8 slots)
├── QueueSlot.jsx                  // Individual queue slot card
├── OrderCarton.jsx                // Order box traveling on conveyor
├── BarcodeScanPanel.jsx           // Scanner input + scan history
├── ScanResultCard.jsx             // Shows result after scanning (divert/pass/block)
├── QueueOverflowAlert.jsx         // Alert when queue is full
├── ConveyorStats.jsx              // Global conveyor statistics
├── ConveyorTimeline.jsx           // Order journey timeline across sub-stations
├── QueueManagementPanel.jsx       // Queue operations (reorder, remove, prioritize)
└── ConveyorControls.jsx           // Start/Stop/Pause conveyor buttons
```

```
src/components/conveyor/config/
├── ConveyorSettingsForm.jsx       // Main configuration form
├── ZoneConfigCard.jsx             // Zone configuration card
├── SubStationQueueConfig.jsx      // Per-sub-station queue settings
├── ScanningSettings.jsx           // Barcode scanner settings
├── PriorityRulesConfig.jsx        // Priority routing rules
└── ConveyorTestPanel.jsx          // Test conveyor operations
```

### 8.4 New Services

```
src/services/conveyorService.js    // All conveyor API calls + mock data
```

### 8.5 New Redux Slice

```
src/redux/slices/conveyorSlice.js  // Conveyor state management
```

---

## 9. Redux State Management

### 9.1 Conveyor Slice

```typescript
interface ConveyorState {
  // Conveyor System Status
  isRunning: boolean;
  conveyorSpeed: 'SLOW' | 'NORMAL' | 'FAST';
  
  // Orders on Conveyor
  conveyorOrders: ConveyorOrder[];
  selectedOrderId: string | null;
  
  // Queue Data (keyed by sub-station ID)
  queues: {
    [subStationId: string]: SubStationQueue;
  };
  
  // Scan Events
  recentScans: BarcodeScanEvent[];
  
  // Global Stats
  stats: {
    totalOrdersOnConveyor: number;
    totalInQueues: number;
    totalProcessing: number;
    totalCompletedToday: number;
    totalBlocked: number;
    avgQueueWaitTime: number;
    avgProcessingTime: number;
  };
  
  // Configuration
  config: ConveyorConfig | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  activeView: 'overview' | 'queues' | 'scanning' | 'config';
  
  // Real-time
  lastUpdated: string;
  isConnected: boolean;  // WebSocket connection status
}
```

### 9.2 Slice Actions

```typescript
// Async Thunks
fetchConveyorStatus          // GET /api/conveyor/status
fetchConveyorConfig          // GET /api/conveyor/config
updateConveyorConfig         // PUT /api/conveyor/config
startConveyor                // POST /api/conveyor/start
stopConveyor                 // POST /api/conveyor/stop
pauseConveyor                // POST /api/conveyor/pause
scanBarcode                 // POST /api/conveyor/scan
divertToQueue               // POST /api/conveyor/queue/divert
removeFromQueue             // POST /api/conveyor/queue/remove
completeProcessing          // POST /api/conveyor/queue/complete
returnToConveyor            // POST /api/conveyor/queue/return
reprioritizeInQueue         // POST /api/conveyor/queue/reorder
fetchQueueStatus            // GET /api/conveyor/queues/:subStationId

// Reducers (synchronous — for WebSocket updates)
updateOrderPosition         // WS: order moved on conveyor
updateQueueStatus           // WS: queue changed
addScanEvent                // WS: new scan event
updateConveyorRunning       // WS: conveyor started/stopped
setConnected                // WS: connection status
```

---

## 10. WebSocket Real-Time Events

### 10.1 Server → Client Events

```typescript
// Connection
'conveyor:connected'          // WebSocket connected
'conveyor:disconnected'       // WebSocket disconnected

// Order Movement
'order:entered_conveyor'      // New order placed on conveyor
'order:position_update'       // Order moved to new position
'order:diverting'             // Order being diverted to queue
'order:queued'                // Order added to queue
'order:processing_started'    // Processing began at sub-station
'order:processing_completed'  // Processing done, returning to conveyor
'order:returned_to_conveyor'  // Order back on main belt
'order:completed'             // All sub-stations done
'order:blocked'               // Cannot divert — queue full

// Queue Events
'queue:status_update'         // Queue size changed
'queue:full'                  // Queue reached max capacity
'queue:space_available'       // Space freed up in queue
'queue:reordered'             // Queue order changed

// Conveyor System
'conveyor:started'            // Conveyor belt started
'conveyor:stopped'            // Conveyor belt stopped
'conveyor:paused'             // Conveyor belt paused
'conveyor:speed_changed'      // Speed setting changed

// Scan Events
'scan:result'                 // Scan result (divert/pass/block)
'scan:error'                  // Scan error (invalid barcode)
```

### 10.2 Client → Server Events

```typescript
'scan:barcode'                // Submit barcode scan
'conveyor:start'              // Start conveyor
'conveyor:stop'               // Stop conveyor
'conveyor:pause'              // Pause conveyor
'queue:complete'              // Mark processing complete
'queue:return'                // Return order to conveyor
'queue:reorder'               // Change queue order
'queue:remove'                // Remove order from queue
```

---

## 11. API Design

### 11.1 Conveyor Status APIs

#### GET /api/conveyor/status
Returns the complete conveyor system status.

#### GET /api/conveyor/orders
Returns all orders currently on the conveyor.

#### GET /api/conveyor/orders/:orderId
Returns detailed info for a specific order on conveyor.

### 11.2 Conveyor Control APIs

#### POST /api/conveyor/start
Start the conveyor belt.

#### POST /api/conveyor/stop
Emergency stop the conveyor belt.

#### POST /api/conveyor/pause
Pause the conveyor belt.

### 11.3 Scanning APIs

#### POST /api/conveyor/scan
Submit a barcode scan from a sub-station.

**Request:**
```json
{
  "barcode": "ORD-20260413-001|STN-ABBOTT,STN-CIPLA,STN-SUN|12|34500",
  "subStationId": "STN-ABBOTT",
  "scannedBy": "STAFF-001"
}
```

**Response:**
```json
{
  "success": true,
  "decision": "DIVERT",
  "order": { /* ConveyorOrder object */ },
  "queueStatus": {
    "currentSize": 3,
    "maxSize": 8,
    "isFull": false,
    "assignedPosition": 4
  },
  "message": "Order diverted to Queue position 4"
}
```

### 11.4 Queue Management APIs

#### GET /api/conveyor/queues
Returns all sub-station queues.

#### GET /api/conveyor/queues/:subStationId
Returns queue for a specific sub-station.

#### POST /api/conveyor/queue/complete
Mark processing complete at a sub-station.

**Request:**
```json
{
  "orderId": "ORD-20260413-001",
  "subStationId": "STN-ABBOTT",
  "completedBy": "STAFF-001",
  "notes": "All Abbott products filled"
}
```

#### POST /api/conveyor/queue/return
Return order to main conveyor after processing.

#### POST /api/conveyor/queue/reorder
Change priority/order within a queue.

#### DELETE /api/conveyor/queue/:orderId
Remove an order from a queue (emergency/manual override).

### 11.5 Configuration APIs

#### GET /api/conveyor/config
Get conveyor system configuration.

#### PUT /api/conveyor/config
Update conveyor configuration.

**Request:**
```json
{
  "conveyorSpeed": "NORMAL",
  "autoDivert": true,
  "defaultMaxQueueSize": 8,
  "priorityRouting": true,
  "zones": [ /* zone configs */ ]
}
```

#### GET /api/conveyor/config/substations
Get per-sub-station queue configurations.

#### PUT /api/conveyor/config/substations/:subStationId
Update queue config for a specific sub-station.

---

## 12. Component Hierarchy

### 12.1 Conveyor Controller Page

```
ConveyorControllerPage
├── PageHeader
│   ├── Title: "Conveyor Controller"
│   ├── Status Badge (Running/Stopped/Paused)
│   └── WebSocket Connection Indicator
│
├── ConveyorControls
│   ├── Start/Stop Button
│   ├── Pause Button
│   └── Speed Selector
│
├── ConveyorStats (4 stat cards)
│   ├── On Conveyor (blue)
│   ├── In Queues (orange)
│   ├── Processing (purple)
│   └── Completed Today (green)
│
├── Tab Navigation
│   ├── "Overview" tab
│   ├── "Queues" tab
│   └── "Scanner" tab
│
├── [Overview Tab]
│   └── ConveyorOverview
│       ├── ConveyorLane (animated horizontal belt)
│       │   └── OrderCarton[] (boxes moving along belt)
│       └── SubStationNode[] (stations below the belt)
│           ├── Station info (name, status)
│           ├── Queue count badge (X/8)
│           └── QueueVisualization
│               └── QueueSlot × 8
│                   ├── Empty slot (gray dashed)
│                   ├── Waiting slot (orange)
│                   ├── Processing slot (purple, highlighted)
│                   └── Done slot (green, fading out)
│
├── [Queues Tab]
│   └── QueueManagementPanel
│       ├── Sub-station selector dropdown
│       ├── Queue header (name, count, status)
│       ├── QueueVisualization (detailed)
│       │   └── QueueSlot × 8 (interactive)
│       │       ├── Order info (ID, items, pharmacy)
│       │       ├── Processing timer
│       │       ├── "Complete" button
│       │       └── "Return to Conveyor" button
│       ├── Queue actions
│       │   ├── Reorder (drag & drop)
│       │   ├── Remove order
│       │   └── Priority override
│       └── Queue history
│
└── [Scanner Tab]
    └── BarcodeScanPanel
        ├── Scanner input (auto-focus text field)
        ├── Manual barcode entry
        ├── Current sub-station selector
        ├── ScanResultCard (shows after scan)
        │   ├── Order info
        │   ├── Decision (DIVERT / PASS / BLOCK)
        │   ├── Queue status
        │   └── Action buttons
        └── Recent scans list
```

### 12.2 Conveyor Configuration Page

```
ConveyorConfigPage
├── PageHeader
│   └── Title: "Conveyor Configuration"
│
├── ConveyorSettingsForm
│   ├── Global Settings
│   │   ├── Conveyor Speed selector
│   │   ├── Auto-divert toggle
│   │   ├── Require scan confirm toggle
│   │   └── Auto-return toggle
│   │
│   ├── Queue Settings
│   │   ├── Default max queue size (default: 8)
│   │   ├── Allow overflow toggle
│   │   └── Overflow max size (default: 10)
│   │
│   ├── Priority Settings
│   │   ├── Priority routing toggle
│   │   └── Max skip positions
│   │
│   └── Save Button
│
├── ZoneConfigCard × N
│   ├── Zone name
│   ├── Position on conveyor
│   ├── Active toggle
│   └── Sub-stations list
│
├── SubStationQueueConfig × N
│   ├── Sub-station name
│   ├── Max queue size override
│   ├── Scanner settings
│   │   ├── Scanner ID
│   │   ├── Input mode
│   │   └── Debounce time
│   └── Processing settings
│       ├── Auto-return after process
│       └── Processing timeout (minutes)
│
└── ConveyorTestPanel
    ├── Test scan
    ├── Test diversion
    ├── Test queue overflow
    └── Reset test data
```

---

## 13. Conveyor Configuration Module

### 13.1 Route & Navigation

```
Route: /conveyor-config
Sidebar Label: "Conveyor Config"
Icon: settings-gear
Roles: MANAGEMENT, ADMIN
Position: Under "Sub-Station Status" in sidebar
```

### 13.2 Configuration Options

| Setting | Type | Default | Description |
|---|---|---|---|
| `conveyorSpeed` | select | NORMAL | SLOW / NORMAL / FAST |
| `isRunning` | toggle | true | Master conveyor on/off |
| `autoDivert` | toggle | true | Auto-divert orders to queues |
| `requireScanConfirm` | toggle | false | Operator must confirm each scan |
| `defaultMaxQueueSize` | number | 8 | Max orders per queue |
| `allowOverflow` | toggle | false | Allow exceeding max in emergency |
| `overflowMaxSize` | number | 10 | Max when overflow allowed |
| `autoReturnAfterProcess` | toggle | true | Auto-return after processing |
| `scanTimeout` | number | 30 | Seconds before unconfirmed scan expires |
| `priorityRouting` | toggle | false | HIGH priority orders skip queue |
| `priorityMaxSkip` | number | 2 | Max positions to skip |

### 13.3 Per-Sub-Station Overrides

Each sub-station can override the global queue settings:

| Setting | Type | Default | Description |
|---|---|---|---|
| `maxQueueSize` | number | 8 (from global) | Custom max for this station |
| `scannerEnabled` | toggle | true | Is scanner active at this station |
| `scannerDebounce` | number | 500 | Debounce between scans (ms) |
| `processingTimeout` | number | 30 | Alert if processing takes > N minutes |
| `autoReturn` | toggle | true (from global) | Auto-return after processing |

---

## 14. Conveyor Controller Module

### 14.1 Route & Navigation

```
Route: /conveyor-controller
Sidebar Label: "Conveyor Controller"
Icon: conveyor-belt
Roles: STAFF, MANAGEMENT, ADMIN, OPERATOR
Position: Under "Sub-Station Status" in sidebar
```

### 14.2 Page Layout — Overview Tab

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔵 Conveyor Controller          [● Connected]   [▶ Running]      │
│  Real-time warehouse conveyor monitoring                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ On Belt  │ │ In Queues│ │Processing│ │Completed │              │
│  │    12    │ │    23    │ │     5    │ │    47    │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                     │
│  ═════════════ MAIN CONVEYOR BELT (→ NORMAL) ══════════════════    │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ BOX │ │ BOX │ │ BOX │ │ BOX │ │ BOX │ │ BOX │ │ BOX │  →     │
│  │ 001 │ │ 002 │ │ 003 │ │ 004 │ │ 005 │ │ 006 │ │ 007 │        │
│  └──┬──┘ └─────┘ └──┬──┘ └─────┘ └──┬──┘ └─────┘ └─────┘        │
│     │           │              │           │                       │
│     ▼           ▼              ▼           ▼                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ ABBOTT   │ │ MANKIND  │ │ CIPLA    │ │ SUN      │              │
│  │ Queue 5/8│ │ Queue 3/8│ │ Queue 7/8│ │ Queue 1/8│              │
│  │ ┌─┬─┬─┐ │ │ ┌─┬─┬─┐ │ │ ┌─┬─┬─┐ │ │ ┌─┬─┬─┐ │              │
│  │ │1│2│3│ │ │ │1│2│3│ │ │ │1│2│3│ │ │ │1│ │ │ │              │
│  │ │4│5│ │ │ │ │ │ │ │ │ │4│5│6│ │ │ │ │ │ │ │              │
│  │ │ │ │ │ │ │ │ │ │ │ │ │7│8│ │ │ │ │ │ │ │              │
│  │ └─┴─┴─┘ │ │ └─┴─┴─┘ │ │ └─┴─┴─┘ │ │ └─┴─┴─┘ │              │
│  │ ★ Proc  │ │          │ │ ★ Proc  │ │          │              │
│  │ ORD-005 │ │          │ │ ORD-003 │ │          │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ LUPIN    │ │ ZYDUS    │ │ DR.REDDY │ │ AJANTA   │              │
│  │ Queue 0/8│ │ Queue 4/8│ │ Queue 0/8│ │ Queue 2/8│              │
│  │ (Idle)   │ │ ┌─┬─┬─┐ │ │ (Idle)   │ │ ┌─┬─┬─┐ │              │
│  │          │ │ │1│2│3│ │ │          │ │ │1│2│ │ │              │
│  │          │ │ │4│ │ │ │ │          │ │ │ │ │ │ │              │
│  │          │ │ └─┴─┴─┘ │ │          │ │ └─┴─┴─┘ │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                     │
│  ═════════════════════ DISPATCH ZONE ═════════════════════════    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 14.3 Queue Slot Visual States

```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ WAITING │  │PROCESSING│  │  DONE   │  │  EMPTY  │  │ BLOCKED │
│         │  │         │  │         │  │         │  │         │
│ ┌─────┐ │  │ ┌─────┐ │  │ ┌─────┐ │  │ ╎     ╎ │  │ ┌─────┐ │
│ │ ORD │ │  │ │ ORD │ │  │ │ ORD │ │  │ ╎     ╎ │  │ │ ORD │ │
│ │ 003 │ │  │ 005 │ │  │ 001 │ │  │ ╎     ╎ │  │ 007 │ │
│ └─────┘ │  │ │Proc. │ │  │ └─────┘ │  │ ╎     ╎ │  │ │Wait │ │
│ 3 items │  │ │4/6 ✅ │ │  │  ✓     │  │ ╎     ╎ │  │ │Queue│ │
│ Abbott  │  │ │  2:34 │ │  │        │  │ ╎     ╎ │  │ │Full │ │
│ 🟠      │  │ │       │ │  │ 🟢     │  │ ⬜      │  │ │  🟥  │ │
└─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘
  Orange       Purple        Green        Gray         Red
```

### 14.4 Scanner Panel Layout

```
┌─────────────────────────────────────────────────────────┐
│  📷 Barcode Scanner — STN-ABBOTT (Zone A - Station 1)  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  🔍 Scan barcode...                    [_] Auto   │  │
│  │                                                   │  │
│  │  (Auto-focus input field — scanner types here)   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ✅ SCAN RESULT — DIVERT TO QUEUE                │  │
│  │                                                   │  │
│  │  Order:    ORD-20260413-001                       │  │
│  │  Pharmacy: Shiv Medical Store                     │  │
│  │  Items:    4 Abbott products                      │  │
│  │  Queue:    Position 4/8                           │  │
│  │                                                   │  │
│  │  [Confirm Divert]  [Skip]  [Block]               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Recent Scans:                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 14:32:05  ORD-003  →  DIVERT  →  Queue pos 5  │    │
│  │ 14:31:22  ORD-002  →  PASS    →  No items      │    │
│  │ 14:30:10  ORD-001  →  BLOCKED →  Queue full    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 15. Integration with Existing Modules

### 15.1 Sub-Station Status Page Enhancement

The existing `SubStationStatus.jsx` page will be enhanced to show queue information:

**Current:**
```jsx
// Shows: station name, status, active orders, completed, avg time
```

**Enhanced:**
```jsx
// Shows: station name, status, active orders, completed, avg time
// NEW: Queue count badge (X/8)
// NEW: Queue visualization mini-view
// NEW: Click to open Conveyor Controller focused on this station
```

**Changes needed in `SubStationStatus.jsx`:**
```jsx
// Add import
import { getQueueStatus } from '../services/conveyorService';

// Add to each station card:
<div className="border-t border-gray-100 pt-3 mt-3">
  <div className="flex items-center justify-between mb-2">
    <span className="text-xs font-medium text-gray-500 uppercase">Queue</span>
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
      queue.currentSize >= queue.maxSize
        ? 'bg-red-100 text-red-700'
        : queue.currentSize >= queue.maxSize - 2
        ? 'bg-orange-100 text-orange-700'
        : 'bg-green-100 text-green-700'
    }`}>
      {queue.currentSize}/{queue.maxSize}
    </span>
  </div>
  {/* Mini queue slots */}
  <div className="grid grid-cols-8 gap-1">
    {Array.from({length: 8}).map((_, i) => (
      <div key={i} className={`h-6 rounded-sm ${
        i < queue.currentSize
          ? i === queue.processingIndex
            ? 'bg-purple-400'
            : 'bg-orange-300'
          : 'bg-gray-100 border border-dashed border-gray-300'
      }`} />
    ))}
  </div>
</div>
```

### 15.2 Barcode Generator Integration

When a barcode is generated in `BarcodeGenerator.jsx`, the order automatically enters the conveyor system:

```jsx
// After barcode generation:
const handleGenerate = async (orderId) => {
  const barcode = await barcodeService.generate(orderId);
  
  // NEW: Enter order into conveyor system
  await conveyorService.enterConveyor(orderId);
  
  // Show success with conveyor info
  setBarcode(barcode);
};
```

### 15.3 Delivery Module Integration

When all sub-stations complete processing, the order transitions to the delivery pipeline:

```
Conveyor COMPLETED → Order status: READY_FOR_DISPATCH → Delivery module picks up
```

### 15.4 Sidebar Navigation Addition

Add to `constants.js` SIDEBAR_ITEMS array:

```javascript
{
  id: 'conveyor-controller',
  label: 'Conveyor Controller',
  path: '/conveyor-controller',
  icon: 'conveyor',
  roles: [ROLES.STAFF, ROLES.MANAGEMENT, ROLES.ADMIN, ROLES.OPERATOR],
},
{
  id: 'conveyor-config',
  label: 'Conveyor Config',
  path: '/conveyor-config',
  icon: 'config',
  roles: [ROLES.MANAGEMENT, ROLES.ADMIN],
},
```

---

## 16. UI/UX Wireframe Descriptions

### 16.1 Conveyor Controller — Overview Tab

**Purpose:** Bird's-eye view of the entire conveyor system

**Layout:**
- **Top bar:** Page title "Conveyor Controller", green dot "Connected" indicator, conveyor status badge (Running/Stopped), speed indicator
- **Stats row:** 4 cards — On Belt, In Queues, Processing, Completed Today
- **Main visualization:** Horizontal conveyor belt (CSS animated gradient moving left→right). Order cartons shown as small boxes on the belt. Sub-stations shown as cards below the belt with connecting lines showing queue entry/exit.
- **Sub-station cards:** Each shows name, queue count badge (X/8 with color coding), mini queue visualization (8 small colored blocks), currently processing order.
- **Bottom:** Dispatch zone indicator showing completed orders

**Interactions:**
- Click on a sub-station card → opens Queues tab focused on that station
- Click on an order carton → shows order detail popup
- Hover on queue slot → tooltip with order info
- Conveyor start/stop/pause controls in top bar

### 16.2 Conveyor Controller — Queues Tab

**Purpose:** Detailed queue management for a specific sub-station

**Layout:**
- **Sub-station selector:** Dropdown to pick which station to view
- **Queue header:** Station name, status, processing time, queue capacity bar (visual progress bar showing X/8)
- **Queue slots:** 8 large horizontal cards in a vertical list, numbered 1-8
  - Each slot shows: position number, order ID, pharmacy name, item count for this station, elapsed time, status
  - Processing slot is highlighted with purple border and animated
  - Empty slots shown as dashed borders with "Empty" text
  - Done slots shown in green with checkmark, fading opacity
- **Action buttons per slot:** "Complete Processing" (for current), "Remove from Queue" (with confirmation)
- **Queue actions bar:** "Auto-sort by Priority", "Clear Completed", "Emergency Clear All"

**Interactions:**
- Drag & drop to reorder queue positions
- "Complete Processing" → marks current order done, auto-advances next
- "Remove from Queue" → confirmation dialog, returns order to main conveyor
- Click on any slot → order detail sidebar

### 16.3 Conveyor Controller — Scanner Tab

**Purpose:** Barcode scanning interface for sub-station operators

**Layout:**
- **Scanner input:** Large auto-focus text input field at the top. Barcode scanners type here automatically.
- **Sub-station selector:** Which station is scanning (auto-detected or manual)
- **Scan result card:** Appears after each scan, shows:
  - Order info (ID, pharmacy, items)
  - Decision: DIVERT (green) / PASS_THROUGH (blue) / QUEUE_FULL (red) / ALREADY_PROCESSED (gray)
  - If DIVERT: queue position assigned, "Confirm" button (if requireScanConfirm is on)
  - If QUEUE_FULL: "Queue Full" warning, "Wait" or "Force Add" button
- **Recent scans:** Scrollable list of last 20 scans with timestamp, order ID, decision

**Interactions:**
- Scanner auto-types barcode → auto-submits → shows result → auto-clears after 2 seconds
- "Confirm" button required if `requireScanConfirm` is enabled in config
- "Force Add" button available only for ADMIN role (overrides queue capacity)
- Keyboard shortcut: Escape to clear input, Enter to resubmit

### 16.4 Conveyor Configuration Page

**Purpose:** Admin settings for the conveyor system

**Layout:**
- **Global Settings card:** Toggle switches and selectors for conveyor-wide settings
- **Queue Defaults card:** Default max queue size (8), overflow settings
- **Zone Configuration:** Cards for each zone showing position, sub-stations, active toggle
- **Per-Station Overrides:** Table of all sub-stations with individual queue size overrides and scanner settings
- **Priority Rules:** Toggle for priority routing, max skip positions
- **Test Panel:** Buttons to test various scenarios with mock data

**Interactions:**
- All settings auto-save on change (with debounce)
- "Reset to Defaults" button in each section
- Test panel has "Run Test" buttons that create mock scenarios

---

## 17. Error Handling & Edge Cases

### 17.1 Error Scenarios

| Scenario | Handling |
|---|---|
| **Barcode not recognized** | Show "Unknown Barcode" error, allow re-scan |
| **Order not found in system** | Show error with option to create order or ignore |
| **Queue full when scanning** | Show BLOCKED result, order stays on conveyor. Auto-retry when space opens (via WebSocket). |
| **Sub-station offline/maintenance** | Show warning, auto-pass all orders. Don't divert. |
| **Double scan (same barcode twice)** | Debounce prevents within 500ms. If duplicate, show "Already scanned" warning. |
| **WebSocket disconnected** | Show red "Disconnected" indicator. Queue changes stop. Show last known state. Auto-reconnect with exponential backoff. |
| **Processing timeout** | Alert if processing takes > configured timeout (default 30 min). |
| **Conveyor emergency stop** | All diversions halted. Orders stay in current position. Red banner across top. |
| **Queue overflow** | Only allowed if `allowOverflow` is true. Shows amber warning. |
| **Order has no required sub-stations** | Bypasses all queues, goes directly to dispatch. |
| **All sub-stations idle/offline** | Orders accumulate on main conveyor. Alert to operators. |

### 17.2 Edge Cases

| Edge Case | Behavior |
|---|---|
| **Order needs only 1 sub-station** | Scanned → diverted → processed → returned → completed → dispatch |
| **Same sub-station appears multiple times** | Not possible (each product belongs to one company) |
| **Queue has 7 items, 2 arrive simultaneously** | FIFO: first scanned gets position 8, second gets BLOCKED |
| **Priority order when queue is full** | If `priorityRouting` is ON, priority order replaces lowest-priority in queue (that order gets BLOCKED) |
| **Operator marks wrong order as done** | "Complete Processing" requires confirmation. Audit log records who completed what. |
| **Power failure** | State persisted in DB. On restart, all orders remain in their last known positions. |

---

## 18. Security Considerations

| Concern | Mitigation |
|---|---|
| **Unauthorized scanning** | Scanner is tied to sub-station login. Users must be authenticated and assigned to a station. |
| **Force queue add** | Only ADMIN role can override queue capacity. Audit logged. |
| **Barcode tampering** | Barcodes include order checksum. Invalid barcodes rejected. |
| **WebSocket security** | WSS (encrypted). Token-based authentication. |
| **Queue manipulation** | All queue operations (reorder, remove) are role-gated and audit-logged. |
| **Emergency stop** | Only MANAGEMENT+ can emergency stop. Requires confirmation dialog. |

---

## 19. Performance Considerations

| Concern | Solution |
|---|---|
| **Real-time updates** | WebSocket for live conveyor state. Delta updates only (not full state sync). |
| **Many orders on conveyor** | Virtual scrolling for queue lists. Only render visible queue slots. |
| **Animation performance** | CSS animations (not JS). `will-change` on moving elements. `requestAnimationFrame` for smooth conveyor belt. |
| **Mobile responsiveness** | Conveyor overview collapses to list view on mobile. Queue tab is mobile-first. Scanner tab is optimized for tablet (common hardware at sub-stations). |
| **Offline resilience** | Service worker caches last known state. Scanner can queue scans locally and sync when reconnected. |
| **Debounce rapid scans** | 500ms debounce on scanner input. Prevents duplicate processing. |

---

## 20. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create `conveyorService.js` with mock data and API stubs
- [ ] Create `conveyorSlice.js` Redux state management
- [ ] Create base components: `QueueSlot`, `QueueVisualization`, `ConveyorStats`
- [ ] Create Conveyor Configuration page (static settings)
- [ ] Add sidebar navigation entries

### Phase 2: Conveyor Controller (Week 2-3)
- [ ] Create Conveyor Overview tab with visual conveyor map
- [ ] Create Queues tab with interactive queue management
- [ ] Create Scanner tab with barcode input
- [ ] Implement mock WebSocket events for real-time updates
- [ ] Create `SubStationNode`, `OrderCarton`, `ConveyorLane` components

### Phase 3: Sub-Station Status Integration (Week 3)
- [ ] Enhance `SubStationStatus.jsx` with queue count badges
- [ ] Add mini queue visualizations to sub-station cards
- [ ] Add click-through from Sub-Station Status to Conveyor Controller

### Phase 4: Barcode Integration (Week 3-4)
- [ ] Enhance `BarcodeGenerator.jsx` with conveyor entry
- [ ] Implement scan result decision logic
- [ ] Add scan history and audit trail

### Phase 5: Polish & Testing (Week 4)
- [ ] Animations and transitions
- [ ] Error handling and edge cases
- [ ] Mobile responsiveness
- [ ] End-to-end flow testing with mock data
- [ ] Documentation updates

---

## Appendix A: File Structure (New Files)

```
internal-app-front-end/src/
├── components/
│   └── conveyor/
│       ├── ConveyorOverview.jsx
│       ├── ConveyorLane.jsx
│       ├── SubStationNode.jsx
│       ├── QueueVisualization.jsx
│       ├── QueueSlot.jsx
│       ├── OrderCarton.jsx
│       ├── BarcodeScanPanel.jsx
│       ├── ScanResultCard.jsx
│       ├── QueueOverflowAlert.jsx
│       ├── ConveyorStats.jsx
│       ├── ConveyorTimeline.jsx
│       ├── QueueManagementPanel.jsx
│       ├── ConveyorControls.jsx
│       └── config/
│           ├── ConveyorSettingsForm.jsx
│           ├── ZoneConfigCard.jsx
│           ├── SubStationQueueConfig.jsx
│           ├── ScanningSettings.jsx
│           ├── PriorityRulesConfig.jsx
│           └── ConveyorTestPanel.jsx
├── pages/
│   ├── ConveyorController.jsx        // NEW
│   └── ConveyorConfig.jsx            // NEW
├── redux/slices/
│   └── conveyorSlice.js              // NEW
├── services/
│   └── conveyorService.js            // NEW
└── utils/
    └── constants.js                  // MODIFIED (add sidebar entries)
```

## Appendix B: Mock Data Structure

```javascript
// conveyorService.js mock data

const mockConveyorOrders = [
  {
    id: 'CO-001',
    orderId: 'ORD-20260413-001',
    status: 'ON_MAIN_CONVEYOR',
    currentPosition: 'MAIN_CONVEYOR',
    currentZone: 'ZONE_A',
    pharmacyName: 'Shiv Medical Store',
    totalItems: 12,
    requiredSubStations: ['STN-ABBOTT', 'STN-CIPLA', 'STN-SUN'],
    completedSubStations: [],
    priority: 'HIGH',
    // ...
  },
  // ... more orders in various states
];

const mockQueues = {
  'STN-ABBOTT': {
    maxSize: 8,
    currentSize: 5,
    orders: [
      { position: 1, orderId: 'ORD-005', status: 'DONE', ... },
      { position: 2, orderId: 'ORD-008', status: 'WAITING', ... },
      { position: 3, orderId: 'ORD-012', status: 'PROCESSING', ... },
      { position: 4, orderId: 'ORD-015', status: 'WAITING', ... },
      { position: 5, orderId: 'ORD-018', status: 'WAITING', ... },
      // positions 6, 7, 8 are empty
    ],
  },
  // ... more queues
};
```

## Appendix C: Database Schema (Suggested)

```sql
-- Conveyor Orders
CREATE TABLE conveyor_orders (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id),
  barcode VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ON_MAIN_CONVEYOR',
  current_position VARCHAR(50) NOT NULL DEFAULT 'MAIN_CONVEYOR',
  current_zone VARCHAR(20),
  pharmacy_id VARCHAR(50),
  total_items INT DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  required_substations TEXT[],  -- PostgreSQL array
  completed_substations TEXT[],
  priority VARCHAR(10) DEFAULT 'MEDIUM',
  conveyor_entry_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sub-Station Queues
CREATE TABLE substation_queues (
  id VARCHAR(50) PRIMARY KEY,
  substation_id VARCHAR(50) NOT NULL REFERENCES substations(id),
  max_size INT DEFAULT 8,
  current_size INT DEFAULT 0,
  processing_order_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  total_processed_today INT DEFAULT 0,
  last_activity_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Queue Entries
CREATE TABLE queue_entries (
  id VARCHAR(50) PRIMARY KEY,
  queue_id VARCHAR(50) NOT NULL REFERENCES substation_queues(id),
  conveyor_order_id VARCHAR(50) NOT NULL REFERENCES conveyor_orders(id),
  position INT NOT NULL,
  status VARCHAR(20) DEFAULT 'WAITING',
  queued_at TIMESTAMP DEFAULT NOW(),
  started_processing_at TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(queue_id, position)
);

-- Barcode Scans (Audit Log)
CREATE TABLE barcode_scans (
  id VARCHAR(50) PRIMARY KEY,
  barcode VARCHAR(255) NOT NULL,
  scanned_by VARCHAR(50) NOT NULL,
  substation_id VARCHAR(50) NOT NULL,
  conveyor_order_id VARCHAR(50) REFERENCES conveyor_orders(id),
  diversion_decision VARCHAR(30) NOT NULL,
  queue_status_at_scan JSONB,
  scanned_at TIMESTAMP DEFAULT NOW()
);

-- Conveyor Configuration
CREATE TABLE conveyor_config (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'DEFAULT',
  conveyor_speed VARCHAR(10) DEFAULT 'NORMAL',
  is_running BOOLEAN DEFAULT true,
  auto_divert BOOLEAN DEFAULT true,
  default_max_queue_size INT DEFAULT 8,
  allow_overflow BOOLEAN DEFAULT false,
  overflow_max_size INT DEFAULT 10,
  require_scan_confirm BOOLEAN DEFAULT false,
  auto_return_after_process BOOLEAN DEFAULT true,
  scan_timeout INT DEFAULT 30,
  priority_routing BOOLEAN DEFAULT false,
  priority_max_skip INT DEFAULT 2,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(50)
);
```

---

> **Document Status:** DRAFT — Ready for review and implementation planning  
> **Next Step:** Begin Phase 1 implementation — Create `conveyorService.js` and `conveyorSlice.js`
