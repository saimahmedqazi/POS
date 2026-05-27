import {
  supabase,
} from './supabase';

export async function fetchProducts() {
  const {
    data,
    error,
  } = await supabase
    .from(
      'synced_products',
    )
    .select(
      `
      id,
      name,
      barcode,
      sku,
      sale_price
      `,
    )
    .eq(
      'active',
      true,
    )
    .order(
      'name',
      {
        ascending: true,
      },
    );

  if (error) {
    throw error;
  }

  return data || [];
}