import { getLocalLicense } from '../repositories/local-auth.repository';
import { invokePosApi } from './api.service';

export async function fetchRetailerOrders() {
  const license = await getLocalLicense();
  if (!license?.license_key) throw new Error('No active license found');

  const result = await invokePosApi('get-orders', {}, license.license_key);
  return result.data || [];
}

export async function updateRetailerOrderStatus(orderId: string, status: 'PENDING' | 'PARTIAL' | 'FULFILLED' | 'REJECTED') {
  const license = await getLocalLicense();
  if (!license?.license_key) throw new Error('No active license found');

  await invokePosApi('update-order', { orderId, status }, license.license_key);
}

export async function updateRetailerOrderItems(updates: { itemId: string; fulfilledQuantity: number; }[]) {
  const license = await getLocalLicense();
  if (!license?.license_key) throw new Error('No active license found');

  await invokePosApi('update-order-items', { updates }, license.license_key);
}