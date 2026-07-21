import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js"
import { crypto } from "jsr:@std/crypto/crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-signature');
    if (!signature) throw new Error('Missing signature');

    const secret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET');
    if (!secret) throw new Error('Secret not configured');

    const bodyText = await req.text();

    // Verifikasi HMAC-SHA256
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(bodyText)
    );
    
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    const eventName = payload.meta.event_name;

    if (eventName === 'order_created') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Gunakan custom_data untuk menyimpan transaction_id kita saat order dibuat via API Lemon Squeezy
      const customData = payload.meta.custom_data;
      if (customData && customData.transaction_id) {
        const orderId = customData.transaction_id;
        
        const { data: trx, error: trxErr } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', orderId)
          .single();

        if (trx && !trxErr) {
          await supabase
            .from('transactions')
            .update({ status: 'completed' })
            .eq('id', orderId);

          if (trx.package_id) {
            const { error: rpcErr } = await supabase.rpc('fulfill_package_purchase', {
              p_user_id: trx.user_id,
              p_package_id: trx.package_id
            });
            if (rpcErr) {
              console.error('Failed to fulfill package:', rpcErr);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ message: "OK" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
