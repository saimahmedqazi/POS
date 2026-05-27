import {
  supabaseAdmin,
} from './supabase-admin.service';

export async function setRetailerDisabledState(
  retailerId: string,
  disabled: boolean,
) {
  const {
    error,
  } = await supabaseAdmin
    .from(
      'retailers',
    )
    .update({
      disabled,
    })
    .eq(
      'id',
      retailerId,
    );

  if (error) {
    throw error;
  }
}

export async function getRetailersMap() {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from(
      'retailers',
    )
    .select(
      `
      id,
      customer_local_id,
      disabled
      `,
    );

  if (error) {
    throw error;
  }

  const map =
    new Map();

  (
    data || []
  ).forEach(
    (
      retailer: any,
    ) => {
      map.set(
        retailer.customer_local_id,
        retailer,
      );
    },
  );

  return map;
}