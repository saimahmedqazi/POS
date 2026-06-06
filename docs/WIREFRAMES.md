# Application Wireframes

This document provides visual ASCII wireframes representing the core UI layouts and component hierarchy for the CYBSOC POS applications.

## 1. Desktop POS App (Cashier Interface)

```text
+-----------------------------------------------------------------------------+
| [Logo] CYBSOC POS             [Status: ONLINE]  [Cashier: John]  [Logout]   |
+-----------------------------------------------------------------------------+
|                                      |                                      |
|  [ Barcode Input Field / Scanner ]   |  ====== CURRENT TICKET ======        |
|                                      |                                      |
|  +--------------------------------+  |  1x  Mechanical Keyboard  $120.00    |
|  | Product Grid                   |  |  2x  Wireless Mouse        $40.00    |
|  |                                |  |                                      |
|  | [Item A]  [Item B]  [Item C]   |  |                                      |
|  | [Item D]  [Item E]  [Item F]   |  |--------------------------------------|
|  | [Item G]  [Item H]  [Item I]   |  |  Subtotal:                $160.00    |
|  |                                |  |  Tax (10%):                $16.00    |
|  +--------------------------------+  |  TOTAL:                   $176.00    |
|                                      |                                      |
|  +--------------------------------+  |  [  DISCARD  ]     [   CHECKOUT   ]  |
|  | Quick Actions                  |  |                                      |
|  | [Refund] [Discount] [Receipts] |  |                                      |
|  +--------------------------------+  |                                      |
+-----------------------------------------------------------------------------+
```

## 2. Retailer Mobile App (Dark Glassmorphism)

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

## 3. Web Admin Portal (CYBSOC Headquarters)

```text
+-----------------------------------------------------------------------------+
|  [CYBSOC Admin]     |   Dashboard Overview                                  |
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
