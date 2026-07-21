import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    
    if (!payload.package_id) {
      return new Response(
        JSON.stringify({ error: 'package_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      throw new Error('Unauthorized');
    }

    const { data: pkg, error: pkgErr } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', payload.package_id)
      .single();

    if (pkgErr || !pkg) {
      throw new Error('Package not found');
    }

    const amount = pkg.price_idr;

    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
    if (!serverKey) {
      throw new Error('Midtrans Server Key is not configured');
    }

    const authString = btoa(`${serverKey}:`);
    const orderId = `PKG-${crypto.randomUUID()}`;

    const { error: insertErr } = await supabase
      .from('transactions')
      .insert({
        id: orderId,
        user_id: user.id,
        gateway: 'midtrans',
        amount: amount,
        currency: 'IDR',
        package_id: pkg.id,
        status: 'pending'
      });

    if (insertErr) {
      console.error(insertErr);
      throw new Error('Failed to create transaction record');
    }

    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: pkg.id,
          price: amount,
          quantity: 1,
          name: `Paket ${pkg.name}`,
        }
      ],
      customer_details: {
        first_name: user.email?.split('@')[0] || 'User',
        email: user.email
      }
    };

    const response = await fetch('https://app.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(midtransPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Failed to create midtrans transaction');
    }

    return new Response(
      JSON.stringify({ token: data.token, redirect_url: data.redirect_url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
