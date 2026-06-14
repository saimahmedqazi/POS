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

  const {
    data: retailer,
    error:
      retailerError,
  } = await supabase
    .from(
      'retailers',
    )
    .select(
      'id, disabled'
    )
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

  if (
    retailer.disabled
  ) {
    throw new Error(
      'Retailer account is disabled',
    );
  }

  const itemsPayload =
    cartItems.map(
      (
        item,
      ) => ({
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
    throw (
      orderError ||
      new Error(
        'Failed creating order',
      )
    );
  }

  try {
    const {
      error:
        itemsError,
    } = await supabase
      .from(
        'retailer_order_items',
      )
      .insert(
        itemsPayload.map(
          (
            item,
          ) => ({
            ...item,

            order_id:
              order.id,
          }),
        ),
      );

    if (
      itemsError
    ) {
      throw itemsError;
    }

    useCartStore
      .getState()
      .clearCart();

    return order;
  } catch (
    error
  ) {
    console.error(
      'Order creation failed:',
      error,
    );

    await supabase
      .from(
        'retailer_orders',
      )
      .delete()
      .eq(
        'id',
        order.id,
      );

    throw new Error(
      'Unable to place order. Please try again.',
    );
  }

}
export async function getMyOrders() {
  const session =
    await getCurrentSession();

  if (!session) {
    throw new Error(
      'Not authenticated',
    );
  }

  const {
    data: retailer,
    error:
      retailerError,
  } = await supabase
    .from(
      'retailers',
    )
    .select(
      'id'
    )
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

  const {
    data,
    error,
  } = await supabase
    .from('retailer_orders')
    .select(`
      *,
      items: retailer_order_items (
        id,
        product_name,
        requested_quantity,
        unit_price,
        subtotal
      )
    `)
    .eq(
      'retailer_id',
      retailer.id,
    )
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}