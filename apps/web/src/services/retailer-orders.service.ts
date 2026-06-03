import {
  supabaseAdmin,
} from './supabase-admin.service';

export async function fetchRetailerOrders() {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from(
      'retailer_orders',
    )
    .select(
      `
      *,
      retailers (
        id,
        business_name,
        phone,
        customer_local_id
      ),
      retailer_order_items (
        *
      )
      `,
    )
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateRetailerOrderStatus(
  orderId: string,
  status:
    | 'PENDING'
    | 'PARTIAL'
    | 'FULFILLED'
    | 'REJECTED',
) {
  const {
    error,
  } = await supabaseAdmin
    .from(
      'retailer_orders',
    )
    .update({
      status,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      orderId,
    );

  if (error) {
    throw error;
  }
}

export async function updateRetailerOrderItems(
  updates: {
    itemId: string;

    fulfilledQuantity: number;
  }[],
) {
  for (const update of updates) {
    const {
      error,
    } = await supabaseAdmin
      .from(
        'retailer_order_items',
      )
      .update({
        fulfilled_quantity:
          update.fulfilledQuantity,
      })
      .eq(
        'id',
        update.itemId,
      );

    if (error) {
      throw error;
    }
  }
}