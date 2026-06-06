# 📐 Application Wireframes (Overall Project)

This document provides visual ASCII wireframes representing the core UI layouts, screen navigation, and component hierarchies for every major platform in the CYBSOC POS ecosystem.

---

## 1. 🖥️ Web Admin Portal (`apps/admin`)

The Admin Portal is the central headquarters for CYBSOC administrators to generate subscription licenses and manage active SaaS clients.

### 1.1. Admin Authentication
```text
+-------------------------------------------------------------+
|                                                             |
|           [Logo] CYBSOC Headquarters                        |
|                                                             |
|           +-------------------------------------+           |
|           | Secure Admin Login                  |           |
|           |                                     |           |
|           | Admin Email:                        |           |
|           | [ admin@cybsoc.com                ] |           |
|           |                                     |           |
|           | Master Password:                    |           |
|           | [ ********************            ] |           |
|           |                                     |           |
|           |         [ Authenticate ]            |           |
|           +-------------------------------------+           |
|                                                             |
+-------------------------------------------------------------+
```

### 1.2. Admin Dashboard & License Management
```text
+-----------------------------------------------------------------------------+
|  [Logo] CYBSOC      |   Dashboard Overview                                  |
|---------------------|                                                       |
|  > Dashboard        |   [ Active Licenses: 42 ]   [ Total Revenue: $50K ]   |
|  > License Keys     |                                                       |
|  > Retailers        |   Recent License Activity                             |
|  > Settings         |   +------------------------------------------------+  |
|                     |   | KEY       | BUSINESS    | STATUS   | EXPIRES   |  |
|                     |   |-----------|-------------|----------|-----------|  |
|                     |   | POS-XYZ1  | MegaMart    | ACTIVE   | 2026-12   |  |
|                     |   | POS-ABC9  | TechStore   | SUSPEND  | 2026-10   |  |
|                     |   +------------------------------------------------+  |
|                     |                                                       |
|                     |   [ + Generate New License Key ]                      |
+-----------------------------------------------------------------------------+
```

---

## 2. 💻 Desktop POS App (`apps/web` + Tauri)

The Desktop POS is a high-performance Windows application used by Cashiers for checkout, inventory, and customer ledger management.

### 2.1. Startup / Hardware Authentication
```text
+-------------------------------------------------------------+
|                                                             |
|           [Logo] CYBSOC Point of Sale                       |
|                                                             |
|           Hardware Not Recognized.                          |
|           Please enter your CYBSOC License Key:             |
|                                                             |
|           [ POS-XXXX-XXXX-XXXX-XXXX           ]             |
|                                                             |
|                 [ Activate Machine ]                        |
|                                                             |
|           System: Windows 11 | ID: HWID-89A2B               |
+-------------------------------------------------------------+
```

### 2.2. Point of Sale (Checkout Console)
```text
+-----------------------------------------------------------------------------+
| [Logo] POS System             [Status: ONLINE]  [Cashier: John]  [Logout]   |
|-----------------------------------------------------------------------------|
|  [Sidebar]                           |  ====== CURRENT TICKET ======        |
|  > Point of Sale                     |                                      |
|  > Dashboard                         |  1x  Mechanical Keyboard  $120.00    |
|  > Inventory                         |  2x  Wireless Mouse        $40.00    |
|  > Customers                         |                                      |
|  > Ledger                            |                                      |
|  > Incoming Orders                   |--------------------------------------|
|                                      |  Subtotal:                $160.00    |
|  [ Barcode Scanner Input... ]        |  Tax (10%):                $16.00    |
|                                      |  TOTAL:                   $176.00    |
|  +--------------------------------+  |                                      |
|  | [Item A]  [Item B]  [Item C]   |  |  +--------------------------------+  |
|  | [Item D]  [Item E]  [Item F]   |  |  | [ CASH ]  [ CARD ]  [ CREDIT ] |  |
|  +--------------------------------+  |  +--------------------------------+  |
+-----------------------------------------------------------------------------+
```

### 2.3. Customer Ledger (Credit Accounts)
```text
+-----------------------------------------------------------------------------+
| [Logo] POS System             [Status: ONLINE]  [Cashier: John]  [Logout]   |
|-----------------------------------------------------------------------------|
|  [Sidebar]                           |  Customer Ledger                     |
|  > Point of Sale                     |  Search: [ John Doe...            ]  |
|  > Dashboard                         |                                      |
|  > Inventory                         |  +--------------------------------+  |
|  > Customers                         |  | NAME        | PHONE   | CREDIT |  |
|  > Ledger <                          |  |-------------|---------|--------|  |
|  > Incoming Orders                   |  | John Doe    | 555-01  | $50.00 |  |
|                                      |  | Jane Smith  | 555-02  | $0.00  |  |
|                                      |  +--------------------------------+  |
|                                      |                                      |
|                                      |  [ Record Payment ] [ View History ] |
+-----------------------------------------------------------------------------+
```

### 2.4. Incoming Orders (From Retailer App)
```text
+-----------------------------------------------------------------------------+
| [Logo] POS System             [Status: ONLINE]  [Cashier: John]  [Logout]   |
|-----------------------------------------------------------------------------|
|  [Sidebar]                           |  Wholesale Orders                    |
|  > Point of Sale                     |                                      |
|  > Dashboard                         |  [ PENDING ]  [ PROCESSING ]         |
|  > Inventory                         |                                      |
|  > Customers                         |  +--------------------------------+  |
|  > Ledger                            |  | Order #1024 - Pending          |  |
|  > Incoming Orders <                 |  | Retailer: Central Tech Store   |  |
|                                      |  | Total: $1,250.00               |  |
|                                      |  | [ View Items ]  [ Fulfill ]    |  |
|                                      |  +--------------------------------+  |
+-----------------------------------------------------------------------------+
```

---

## 3. 📱 Retailer Mobile App (`apps/mobile`)

The Retailer App uses a stunning Dark Glassmorphism aesthetic. It allows remote retailers to browse the wholesaler's inventory and place supply orders.

### 3.1. Mobile Login Screen
```text
+------------------------------------+
|                                    |
|             [ Logo ]               |
|         RETAILER PORTAL            |
|                                    |
|                                    |
|   Phone Number:                    |
|   [ 03XXXXXXXXX                  ] |
|                                    |
|   Password:                        |
|   [ ************                 ] |
|                                    |
|   [        Sign In        ]        |
|                                    |
|                                    |
|      Powered by CYBSOC             |
+------------------------------------+
```

### 3.2. Supplier Store (Products List)
```text
+------------------------------------+
| [=]                     [Cart (2)] |
|                                    |
|      Welcome back, Retailer        |
|      SUPPLIER STORE                |
|                                    |
|  [Search products by name...  (x)] |
|                                    |
|  +------------------------------+  |
|  | Mechanical Keyboard          |  |
|  | Rs. 15,000                   |  |
|  | [ + Add to Cart            ] |  |
|  +------------------------------+  |
|                                    |
|  +------------------------------+  |
|  | Wireless Gaming Mouse        |  |
|  | Rs. 5,000                    |  |
|  | [ + Add to Cart            ] |  |
|  +------------------------------+  |
|                                    |
| [  Products  ]  [   My Orders    ] |
+------------------------------------+
```

### 3.3. Shopping Cart & Checkout
```text
+------------------------------------+
| <-- Back             Shopping Cart |
|                                    |
|  +------------------------------+  |
|  | Mechanical Keyboard          |  |
|  | Rs. 15,000                   |  |
|  | [Trash]         [ - ] 1 [ + ]|  |
|  +------------------------------+  |
|                                    |
|  +------------------------------+  |
|  | Wireless Mouse               |  |
|  | Rs. 5,000                    |  |
|  | [Trash]         [ - ] 1 [ + ]|  |
|  +------------------------------+  |
|                                    |
|  ====== ORDER SUMMARY ======       |
|  Total Items:                  2   |
|  Estimated Total:     Rs. 20,000   |
|                                    |
|  [       PLACE ORDER           ]   |
+------------------------------------+
```

### 3.4. Order History
```text
+------------------------------------+
| <-- Back                 My Orders |
|                                    |
|  +------------------------------+  |
|  | Order #1024       [ PENDING ]|  |
|  | Oct 24, 2026                 |  |
|  | Total Amount: Rs. 20,000     |  |
|  |                              |  |
|  |       [ View Items v ]       |  |
|  +------------------------------+  |
|                                    |
|  +------------------------------+  |
|  | Order #0981     [ COMPLETED ]|  |
|  | Oct 12, 2026                 |  |
|  | Total Amount: Rs. 45,000     |  |
|  |                              |  |
|  |       [ View Items v ]       |  |
|  +------------------------------+  |
|                                    |
+------------------------------------+
```
