import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js"
import { crypto } from "jsr:@std/crypto/crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json();
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!serverKey) throw new Error('Midtrans server key not found');

    // 1. Verifikasi Signature Key Midtrans
    const orderId = payload.order_id;
    const statusCode = payload.status_code;
    const grossAmount = payload.gross_amount;
    const signatureKey = payload.signature_key;

    const dataString = orderId + statusCode + grossAmount + serverKey;
    const hashBuffer = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(dataString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (signatureKey !== expectedSignature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;

    if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
      if (fraudStatus == 'accept' || !fraudStatus) {
        // Ambil transaksi dari DB
        const { data: trx, error: trxErr } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', orderId)
          .single();

        if (trxErr || !trx) {
          throw new Error('Transaction not found in database');
        }

        // Update status transaksi
        await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('id', orderId);

        // Update profil user jika ini bukan donasi (ada package_id)
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
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', orderId);
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
