import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();

    if (!amount || amount < 10000) {
      return new Response(
        JSON.stringify({ error: 'Nominal donasi minimal Rp 10.000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
    if (!serverKey) {
      throw new Error('Midtrans Server Key is not configured');
    }

    const authString = btoa(`${serverKey}:`);

    const orderId = `DONATION-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: 'DONATION',
          price: amount,
          quantity: 1,
          name: 'Donasi Smart Marketing Tools',
        }
      ],
      customer_details: {
        first_name: 'Donatur',
        last_name: 'Dermawan'
      }
    };

    const response = await fetch('https://app.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Failed to create transaction');
    }

    return new Response(
      JSON.stringify({ token: data.token, redirect_url: data.redirect_url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Midtrans API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
