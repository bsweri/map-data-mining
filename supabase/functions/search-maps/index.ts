import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    
    if (typeof payload.keyword !== 'string' || payload.keyword.trim() === '' || payload.keyword.length > 100) {
      return new Response(JSON.stringify({ error: "Keyword tidak valid atau terlalu panjang." }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (typeof payload.location !== 'string' || payload.location.trim() === '' || payload.location.length > 200) {
      return new Response(JSON.stringify({ error: "Location tidak valid atau terlalu panjang." }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (typeof payload.radius !== 'number' || payload.radius < 1 || payload.radius > 4) {
      return new Response(JSON.stringify({ error: "Radius harus berupa angka antara 1 hingga 4 KM." }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const { keyword, location, radius, user_id, local_id } = payload;
    const apiKey = Deno.env.get('MAPS_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!apiKey) {
      throw new Error('API key not configured di Edge Function')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Quota & Identity Check
    if (!user_id) {
      return new Response(JSON.stringify({ error: "Authentication required. Please login to use the search feature." }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: profile } = await supabase.from('profiles').select('current_membership').eq('id', user_id).single();
    const membershipLevel = profile?.current_membership || 'free';

    // Ambil limit dari membership_plans
    const { data: plan } = await supabase.from('membership_plans').select('daily_credit_quota, weekly_credit_quota, monthly_credit_quota').eq('level', membershipLevel).single();
    if (!plan) throw new Error('Membership plan data not found.');

    const now = new Date();
    
    // Daily Start
    const startOfDay = new Date(now);
    startOfDay.setHours(0,0,0,0);
    
    // Weekly Start (assuming Monday as start of week)
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0,0,0,0);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); 
    startOfWeek.setDate(diff);

    // Monthly Start
    const startOfMonth = new Date(now);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    // Get all counts in one go
    const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
      supabase.from('api_usage_logs').select('id', { count: 'exact', head: true }).eq('user_id', user_id).gte('created_at', startOfDay.toISOString()),
      supabase.from('api_usage_logs').select('id', { count: 'exact', head: true }).eq('user_id', user_id).gte('created_at', startOfWeek.toISOString()),
      supabase.from('api_usage_logs').select('id', { count: 'exact', head: true }).eq('user_id', user_id).gte('created_at', startOfMonth.toISOString())
    ]);

    const errorMessage = "We purchased Google Maps credit for the development of this project, so these limits are strictly enforced. Please upgrade your plan or wait for the quota to reset.";

    if (dailyRes.count !== null && dailyRes.count >= plan.daily_credit_quota) {
      throw new Error(`Daily quota limit (${plan.daily_credit_quota}) has been reached. ${errorMessage}`);
    }
    if (weeklyRes.count !== null && (plan.weekly_credit_quota > 0) && weeklyRes.count >= plan.weekly_credit_quota) {
      throw new Error(`Weekly quota limit (${plan.weekly_credit_quota}) has been reached. ${errorMessage}`);
    }
    if (monthlyRes.count !== null && monthlyRes.count >= plan.monthly_credit_quota) {
      throw new Error(`Monthly quota limit (${plan.monthly_credit_quota}) has been reached. ${errorMessage}`);
    }

    // Lanjutkan Pencarian Google Maps
    let lat, lng;
    const coordMatch = location.match(/^([-+]?\d{1,2}[.]\d+),\s*([-+]?\d{1,3}[.]\d+)$/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    } else {
      const geocodeRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`);
      const geocodeData = await geocodeRes.json();
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
         throw new Error(`Gagal menemukan area: ${location}`);
      }
      const loc = geocodeData.results[0].geometry.location;
      lat = loc.lat;
      lng = loc.lng;
    }

    const radiusMeters = radius * 1000;
    const searchRes = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`);
    const searchData = await searchRes.json();
    
    // Log Activity (sebelum mengembalikan data kosong)
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    await supabase.from('api_usage_logs').insert({
      user_id: user_id,
      endpoint: 'search-maps',
      ip_address: clientIp
    });

    if (searchData.status === 'ZERO_RESULTS') {
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (searchData.status !== 'OK') {
      throw new Error(`Pencarian gagal: ${searchData.status}`);
    }

    const places = searchData.results;
    const mappedPromises = places.map(async (place: any) => {
      const distance = haversine(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
      const basePlace = {
        id: place.place_id,
        name: place.name || 'Nama Tidak Diketahui',
        address: place.vicinity || 'Alamat Tidak Diketahui',
        radiusZone: `${distance.toFixed(1)} KM`,
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}&query_place_id=${place.place_id}`,
        rating: place.rating,
        phone: '-'
      };
      
      try {
        const detailsRes = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number&key=${apiKey}`);
        const detailsData = await detailsRes.json();
        if (detailsData.status === 'OK' && detailsData.result) {
          basePlace.phone = detailsData.result.formatted_phone_number || '-';
        }
      } catch (e) {
      }
      return basePlace;
    });

    const mappedData = await Promise.all(mappedPromises);

    return new Response(JSON.stringify({ data: mappedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
