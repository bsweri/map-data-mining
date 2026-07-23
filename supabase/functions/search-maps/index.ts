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

    const { data: profile } = await supabase.from('profiles').select('status, credit, last_extraction_at').eq('id', user_id).single();
    if (!profile) {
       throw new Error('Profile not found.');
    }

    if (profile.status !== 'active') {
       throw new Error(`Status akun Anda adalah '${profile.status}'. Anda harus dalam status 'active' untuk melakukan ekstraksi.`);
    }

    const { data: settings } = await supabase.from('admin_settings').select('extraction_interval_seconds').single();
    const intervalSeconds = settings?.extraction_interval_seconds || 30;

    const now = new Date();
    if (profile.last_extraction_at) {
       const lastExtraction = new Date(profile.last_extraction_at);
       const diffSeconds = (now.getTime() - lastExtraction.getTime()) / 1000;
       if (diffSeconds < intervalSeconds) {
          throw new Error(`Harap tunggu ${Math.ceil(intervalSeconds - diffSeconds)} detik sebelum melakukan ekstraksi lagi.`);
       }
    }

    // Determine initial credit requirements
    let lat, lng;
    const coordMatch = location.match(/^([-+]?\d{1,2}[.]\d+),\s*([-+]?\d{1,3}[.]\d+)$/);
    let requiredInitialCredit = 1; // for nearbysearch
    if (!coordMatch) requiredInitialCredit++; // for geocode

    if (profile.credit < requiredInitialCredit) {
       throw new Error(`Kredit tidak cukup. Dibutuhkan minimal ${requiredInitialCredit} kredit untuk memulai pencarian.`);
    }

    let usedCredits = 0;
    const apiStats = {
      gmaps_geocode: 0,
      gmaps_nearbysearch: 0,
      gmaps_placedetails: 0
    };

    // Geocode if needed
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    } else {
      const geocodeRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`);
      const geocodeData = await geocodeRes.json();
      usedCredits++; // 1 API call
      apiStats.gmaps_geocode++;
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
         // Deduct credit anyway since we called the API
         await deductCredit(supabase, user_id, usedCredits);
         throw new Error(`Gagal menemukan area: ${location}`);
      }
      const loc = geocodeData.results[0].geometry.location;
      lat = loc.lat;
      lng = loc.lng;
    }

    // Nearby Search
    const radiusMeters = radius * 1000;
    const searchRes = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`);
    const searchData = await searchRes.json();
    usedCredits++; // 1 API call
    apiStats.gmaps_nearbysearch++;
    
    // Log Activity
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    await supabase.from('api_usage_logs').insert({
      user_id: user_id,
      endpoint: 'search-maps',
      ip_address: clientIp
    });

    if (searchData.status === 'ZERO_RESULTS') {
      await deductCredit(supabase, user_id, usedCredits);
      await logApiStats(supabase, apiStats);
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (searchData.status !== 'OK') {
      await deductCredit(supabase, user_id, usedCredits);
      await logApiStats(supabase, apiStats);
      throw new Error(`Pencarian gagal: ${searchData.status}`);
    }

    const places = searchData.results;
    
    // Determine how many place details we can fetch based on remaining credit
    const availableCredit = profile.credit - usedCredits;
    const detailsToFetch = Math.min(places.length, availableCredit);
    usedCredits += detailsToFetch;
    apiStats.gmaps_placedetails += detailsToFetch;

    const mappedPromises = places.map(async (place: any, index: number) => {
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
      
      if (index < detailsToFetch) {
        try {
          const detailsRes = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number&key=${apiKey}`);
          const detailsData = await detailsRes.json();
          if (detailsData.status === 'OK' && detailsData.result) {
            basePlace.phone = detailsData.result.formatted_phone_number || '-';
          }
        } catch (e) {
        }
      }
      return basePlace;
    });

    const mappedData = await Promise.all(mappedPromises);

    // Final deduction and log
    await deductCredit(supabase, user_id, usedCredits);
    await logApiStats(supabase, apiStats);

    return new Response(JSON.stringify({ data: mappedData, creditsUsed: usedCredits }), {
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

async function deductCredit(supabase: any, userId: string, usedCredits: number) {
   if (usedCredits > 0) {
     const { data: current } = await supabase.from('profiles').select('credit').eq('id', userId).single();
     if (current) {
        await supabase.from('profiles').update({ 
          credit: Math.max(0, current.credit - usedCredits),
          last_extraction_at: new Date().toISOString()
        }).eq('id', userId);
     }
  }
}

async function logApiStats(supabase: any, stats: Record<string, number>) {
  const filteredStats = Object.fromEntries(Object.entries(stats).filter(([_, v]) => v > 0));
  if (Object.keys(filteredStats).length > 0) {
    await supabase.rpc('increment_multiple_api_stats', { p_stats: filteredStats });
  }
}
