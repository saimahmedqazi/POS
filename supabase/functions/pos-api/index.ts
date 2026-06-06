import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, payload } = await req.json();

    if (!action || !payload) {
      throw new Error('Missing action or payload');
    }

    const { licenseKey, machineId } = payload;
    if (!licenseKey || !machineId) {
      throw new Error('Missing licenseKey or machineId');
    }

    // AUTHENTICATE REQUEST (All requests must have a valid license key)
    const { data: license, error: licenseError } = await supabaseClient
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single();

    if (licenseError || !license) {
      throw new Error('Invalid License Key');
    }

    if (license.machine_id && license.machine_id !== machineId) {
      throw new Error('License is bound to another machine');
    }

    if (license.status !== 'ACTIVE' && action !== 'activate-license') {
      throw new Error('License is not active');
    }

    // ROUTING
    let result = null;

    switch (action) {
      case 'activate-license':
        {
          const { businessName } = payload;
          const { error } = await supabaseClient
            .from('licenses')
            .update({
              status: 'ACTIVE',
              machine_id: machineId,
              business_name: businessName,
              last_validated_at: new Date().toISOString()
            })
            .eq('id', license.id);
          
          if (error) throw error;
          result = { 
            success: true,
            businessName: businessName || license.business_name,
            expiresAt: license.expires_at 
          };
        }
        break;

      case 'validate-license':
        {
          const { error } = await supabaseClient
            .from('licenses')
            .update({
              last_validated_at: new Date().toISOString()
            })
            .eq('id', license.id);
          
          if (error) throw error;
          result = { success: true };
        }
        break;

      case 'get-cloud-backups':
        {
          const { data, error } = await supabaseClient
            .from('cloud_backups')
            .select('*')
            .eq('license_key', license.license_key)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          result = { data };
        }
        break;

      case 'get-cloud-backup-by-id':
        {
          const { backupId } = payload;
          if (!backupId) throw new Error('Missing backupId');

          const { data, error } = await supabaseClient
            .from('cloud_backups')
            .select('backup_data')
            .eq('id', backupId)
            .eq('license_key', license.license_key)
            .single();

          if (error) throw error;
          result = { backupData: data.backup_data };
        }
        break;

      case 'create-cloud-backup':
        {
          const { backupData } = payload;
          if (!backupData) throw new Error('Missing backupData');

          const backupJson = JSON.stringify(backupData);
          
          const { error } = await supabaseClient
            .from('cloud_backups')
            .insert({
              license_key: license.license_key,
              backup_version: Date.now(),
              backup_size: backupJson.length,
              backup_data: backupData,
            });
          
          if (error) throw error;

          // KEEP ONLY LATEST 30
          const { data: backups } = await supabaseClient
            .from('cloud_backups')
            .select('id')
            .eq('license_key', license.license_key)
            .order('created_at', { ascending: false });

          if (backups && backups.length > 30) {
            const idsToDelete = backups.slice(30).map((b: any) => b.id);
            await supabaseClient
              .from('cloud_backups')
              .delete()
              .in('id', idsToDelete);
          }

          result = { success: true };
        }
        break;

      case 'sync-products':
        {
          const { products } = payload;
          if (!Array.isArray(products)) throw new Error('Invalid products array');
          
          if (products.length > 0) {
            const mapped = products.map((p: any) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              barcode: p.barcode,
              sale_price: Number(p.sale_price || p.salePrice || 0),
              quantity: Number(p.quantity || 0),
              available_quantity: Number(p.quantity || 0),
              active: true,
              updated_at: new Date().toISOString()
            }));
            
            const { error } = await supabaseClient
              .from('synced_products')
              .upsert(mapped, { onConflict: 'id' });
              
            if (error) throw error;
          }
          
          result = { success: true };
        }
        break;

      case 'get-retailers':
        {
          const { data, error } = await supabaseClient
            .from('retailers')
            .select(`id, customer_local_id, disabled`);
          
          if (error) throw error;
          result = { data };
        }
        break;

      case 'update-retailer':
        {
          const { retailerId, disabled } = payload;
          const { error } = await supabaseClient
            .from('retailers')
            .update({ disabled })
            .eq('id', retailerId);
            
          if (error) throw error;
          result = { success: true };
        }
        break;

      case 'get-orders':
        {
          const { data, error } = await supabaseClient
            .from('retailer_orders')
            .select(`
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
            `)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          result = { data };
        }
        break;

      case 'update-order':
        {
          const { orderId, status } = payload;
          const { error } = await supabaseClient
            .from('retailer_orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', orderId);
            
          if (error) throw error;
          result = { success: true };
        }
        break;

      case 'update-order-items':
        {
          const { updates } = payload;
          if (!Array.isArray(updates)) throw new Error('Invalid updates array');

          for (const update of updates) {
            const { error } = await supabaseClient
              .from('retailer_order_items')
              .update({ fulfilled_quantity: update.fulfilledQuantity })
              .eq('id', update.itemId);
              
            if (error) throw error;
          }

          result = { success: true };
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
