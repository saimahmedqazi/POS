import { supabase } from './supabase.service';
import { getMachineId } from './machine.service';

export async function invokePosApi(action: string, payload: any = {}, licenseKey?: string) {
  if (!licenseKey) {
    throw new Error('License Key is required to call POS API');
  }

  const machineId = await getMachineId();

  const { data, error } = await supabase.functions.invoke('pos-api', {
    body: {
      action,
      payload: {
        ...payload,
        licenseKey,
        machineId,
      }
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to communicate with cloud API');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}
