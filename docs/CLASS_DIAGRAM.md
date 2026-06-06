# System Class Diagrams

The CYBSOC POS ecosystem relies on a robust relational database schema hosted on Supabase. Below is the Entity-Relationship (ER) / Class Diagram defining the core data structures and their associations.

```mermaid
classDiagram
    %% Entities
    class User {
        +UUID id
        +String email
        +String role
        +DateTime created_at
        +login()
        +logout()
    }

    class License {
        +UUID id
        +String license_key
        +String machine_id
        +String business_name
        +String status
        +DateTime expires_at
        +validate()
        +suspend()
    }

    class Product {
        +UUID id
        +String name
        +String sku
        +String barcode
        +Decimal cost_price
        +Decimal sale_price
        +Int stock_quantity
        +updateStock()
    }

    class Order {
        +UUID id
        +UUID retailer_id
        +String status
        +Decimal total_amount
        +DateTime created_at
        +calculateTotal()
        +process()
    }

    class OrderItem {
        +UUID id
        +UUID order_id
        +UUID product_id
        +Int requested_quantity
        +Decimal unit_price
        +Decimal subtotal
    }

    %% Relationships
    User "1" -- "*" License : Administrates
    Order "1" *-- "*" OrderItem : Contains
    Product "1" -- "*" OrderItem : Referenced By
    User "1" -- "*" Order : Places (Retailer)
```

### Explanation of Entities
1. **User**: Represents either a CYBSOC Administrator, a Retailer, or a Cashier. Row Level Security (RLS) policies use the `role` and `id` to restrict data access.
2. **License**: Bound to a specific Windows `machine_id`. Validated by the Desktop POS at startup.
3. **Product**: The master inventory table containing pricing and barcodes used by the Desktop barcode scanner and Mobile ordering app.
4. **Order & OrderItem**: Tracks wholesale supply requests from Retailers to the central warehouse.
