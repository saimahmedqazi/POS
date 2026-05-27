import {
  supabase,
} from './supabase';

import {
  getCurrentSession,
} from './auth.service';

import {
  useCartStore,
} from '../store/cart.store';

export async function placeOrder() {
  const session =
    await getCurrentSession();

  if (!session) {
    throw new Error(
      'Not authenticated',
    );
  }

  const cartItems =
    useCartStore.getState()
      .items;

  if (
    cartItems.length === 0
  ) {
    throw new Error(
      'Cart is empty',
    );
  }

  const total =
    cartItems.reduce(
      (
        sum,
        item,
      ) =>
        sum +
        item.sale_price *
          item.quantity,
      0,
    );

  // GET RETAILER
  const {
    data: retailer,
    error:
      retailerError,
  } = await supabase
    .from(
      'retailers',
    )
    .select('id')
    .eq(
      'auth_user_id',
      session.user.id,
    )
    .single();

  if (
    retailerError ||
    !retailer
  ) {
    throw new Error(
      'Retailer account not found',
    );
  }

  // CREATE ORDER
  const {
    data: order,
    error: orderError,
  } = await supabase
    .from(
      'retailer_orders',
    )
    .insert({
      retailer_id:
        retailer.id,

      total_amount:
        total,

      status:
        'PENDING',
    })
    .select()
    .single();

  if (
    orderError ||
    !order
  ) {
    throw orderError;
  }

const itemsPayload =
  cartItems.map(
    (
      item,
    ) => ({
      order_id:
        order.id,

      product_id:
        item.id,

      product_name:
        item.name,

      requested_quantity:
        item.quantity,

      unit_price:
        item.sale_price,

      subtotal:
        item.sale_price *
        item.quantity,
    }),
  );

  const {
    error:
      itemsError,
  } = await supabase
    .from(
      'retailer_order_items',
    )
    .insert(
      itemsPayload,
    );

  if (itemsError) {
    throw itemsError;
  }

  useCartStore
    .getState()
    .clearCart();

  return order;
}