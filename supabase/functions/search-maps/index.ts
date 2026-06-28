import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://bsweri.github.io',
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
    
    const { keyword, location, radius } = payload;
    const apiKey = Deno.env.get('MAPS_API_KEY')

    if (!apiKey) {
      throw new Error('API key not configured di Edge Function')
    }

    let lat, lng;
    
    // Deteksi jika location sudah berupa lat,lng
    const coordMatch = location.match(/^([-+]?\d{1,2}[.]\d+),\s*([-+]?\d{1,3}[.]\d+)$/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    } else {
      // Lakukan Geocode
      const geocodeRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`);
      const geocodeData = await geocodeRes.json();
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
         throw new Error(`Gagal menemukan area: ${location}`);
      }
      const loc = geocodeData.results[0].geometry.location;
      lat = loc.lat;
      lng = loc.lng;
    }

    // Panggil Nearby Search API
    const radiusMeters = radius * 1000;
    const searchRes = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`);
    const searchData = await searchRes.json();
    
    if (searchData.status === 'ZERO_RESULTS') {
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (searchData.status !== 'OK') {
      throw new Error(`Pencarian gagal: ${searchData.status}`);
    }

    // Loop data dan ambil detail (No Telepon)
    const places = searchData.results;
    const mappedPromises = places.map(async (place: any) => {
      // Hitung jarak Haversine (KM)
      const distance = haversine(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
      
      const basePlace = {
        id: place.place_id,
        name: place.name || 'Nama Tidak Diketahui',
        address: place.vicinity || 'Alamat Tidak Diketahui',
        radiusZone: `${distance.toFixed(1)} KM dari pusat`,
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
        // Abaikan error pada detail
      }
      
      return basePlace;
    });

    const mappedData = await Promise.all(mappedPromises);

    return new Response(JSON.stringify({ data: mappedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// Hitung jarak (KM)
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius Bumi dalam KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
