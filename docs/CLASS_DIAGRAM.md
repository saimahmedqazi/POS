# 🗄️ System Class Diagrams (Overall Project)

The CYBSOC POS ecosystem relies on a highly scalable, multi-tenant relational database schema hosted on Supabase. Below is the comprehensive Entity-Relationship (ER) / Class Diagram defining the data structures across the Admin, Desktop POS, and Mobile Retailer applications.

```mermaid
classDiagram
    %% Core Authentication & Security
    class User {
        +UUID id
        +String email
        +String role ["admin", "retailer", "cashier"]
        +DateTime created_at
        +login()
        +logout()
    }

    class License {
        +UUID id
        +String license_key
        +String machine_id
        +String business_name
        +String status ["ACTIVE", "SUSPENDED"]
        +DateTime expires_at
        +DateTime created_at
        +validateMachine()
        +revoke()
    }

    %% Inventory & Products
    class Product {
        +UUID id
        +String name
        +String sku
        +String barcode
        +Decimal cost_price
        +Decimal sale_price
        +Int stock_quantity
        +String category
        +Boolean is_active
        +updateStock()
    }

    %% Desktop POS (Cashier Sales)
    class Sale {
        +UUID id
        +UUID cashier_id
        +UUID customer_id
        +String payment_method ["CASH", "CARD", "CREDIT"]
        +Decimal subtotal
        +Decimal tax_amount
        +Decimal discount_amount
        +Decimal total_amount
        +DateTime completed_at
        +processPayment()
    }

    class SaleItem {
        +UUID id
        +UUID sale_id
        +UUID product_id
        +Int quantity
        +Decimal unit_price
        +Decimal subtotal
    }

    %% Customer & Ledger Management
    class Customer {
        +UUID id
        +String full_name
        +String phone_number
        +String email
        +Decimal credit_balance
        +DateTime created_at
        +updateCredit()
    }

    class LedgerEntry {
        +UUID id
        +UUID customer_id
        +String transaction_type ["PAYMENT", "CREDIT_SALE", "REFUND"]
        +Decimal amount
        +String reference_note
        +DateTime created_at
    }

    %% Mobile App (Retailer Wholesale Orders)
    class RetailerOrder {
        +UUID id
        +UUID retailer_id
        +String status ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]
        +Decimal total_amount
        +DateTime created_at
        +updateStatus()
    }

    class RetailerOrderItem {
        +UUID id
        +UUID order_id
        +UUID product_id
        +Int requested_quantity
        +Decimal unit_price
        +Decimal subtotal
    }

    %% Relationships
    User "1" -- "*" License : Administrates (Admin)
    User "1" -- "*" Sale : Processes (Cashier)
    User "1" -- "*" RetailerOrder : Places (Retailer)

    Customer "1" -- "*" Sale : Makes Purchase
    Customer "1" -- "*" LedgerEntry : Has Transactions

    Sale "1" *-- "*" SaleItem : Contains
    RetailerOrder "1" *-- "*" RetailerOrderItem : Contains

    Product "1" -- "*" SaleItem : Sold As
    Product "1" -- "*" RetailerOrderItem : Requested As
```

### Explanation of Sub-Systems

1. **Security & Licensing (Admin Portal)**
   - The `User` table leverages Supabase Auth. Role-Based Access Control (RBAC) and Row Level Security (RLS) policies ensure Cashiers cannot access Admin views, and Retailers can only see their own orders.
   - The `License` table acts as a cryptographic lock. The Desktop POS hardware (`machine_id`) is permanently bound to a `license_key` upon first boot.

2. **Point of Sale & Customers (Desktop App)**
   - When a cashier rings up a customer, a `Sale` is generated containing multiple `SaleItem`s (linked directly to the `Product` table).
   - If a customer buys on credit, the `Customer` table's `credit_balance` is updated, and a historical `LedgerEntry` is recorded for auditing.

3. **Wholesale Ordering (Mobile App)**
   - Retailers use the mobile app to browse the central `Product` inventory and place `RetailerOrder`s. These orders appear instantly on the Desktop POS dashboard for fulfillment.
