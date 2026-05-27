import {
  supabaseAdmin,
} from './supabase-admin.service';

export async function syncProductsToCloud(
  products: any[],
) {
  const payload =
    products.map(
      (
        product,
      ) => ({
        id: product.id,

        name:
          product.name,

        barcode:
          product.barcode,

        sku: product.sku,

        sale_price:
          Number(
            product.sale_price ||
              product.salePrice ||
              0,
          ),

        quantity:
          Number(
            product.quantity ||
              0,
          ),

        active: true,

        updated_at:
          new Date().toISOString(),
      }),
    );

  const {
    error,
  } = await supabaseAdmin
    .from(
      'synced_products',
    )
    .upsert(
      payload,
      {
        onConflict: 'sku',
      },
    );

  if (error) {
    throw error;
  }
}