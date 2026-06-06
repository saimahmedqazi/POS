import { getLocalLicense } from '../repositories/local-auth.repository';
import { invokePosApi } from './api.service';

export async function syncProductsToCloud(products: any[]) {
  const license = await getLocalLicense();

  if (!license?.license_key) {
    throw new Error('No active license found');
  }

  const payload = products.map((product) => ({
    id: product.id,
    name: product.name,
    barcode: product.barcode,
    sku: product.sku,
    sale_price: Number(product.sale_price || product.salePrice || 0),
    quantity: Number(product.quantity || 0),
    available_quantity: Number(product.quantity || 0),
    active: true,
    updated_at: new Date().toISOString(),
  }));

  await invokePosApi('sync-products', { products: payload }, license.license_key);
}