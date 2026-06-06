import { getLocalLicense } from '../repositories/local-auth.repository';
import { invokePosApi } from './api.service';

export async function setRetailerDisabledState(retailerId: string, disabled: boolean) {
  const license = await getLocalLicense();
  if (!license?.license_key) throw new Error('No active license found');

  await invokePosApi('update-retailer', { retailerId, disabled }, license.license_key);
}

export async function getRetailersMap() {
  const license = await getLocalLicense();
  if (!license?.license_key) throw new Error('No active license found');

  const result = await invokePosApi('get-retailers', {}, license.license_key);

  const map = new Map();
  (result.data || []).forEach((retailer: any) => {
    map.set(retailer.customer_local_id, retailer);
  });

  return map;
}