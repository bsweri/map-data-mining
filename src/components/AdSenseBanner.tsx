import { useEffect } from 'react';

interface AdSenseBannerProps {
  className?: string;
  client?: string;
  slot?: string;
  format?: string;
  responsive?: boolean;
}

export default function AdSenseBanner({
  className = '',
  client = 'ca-pub-XXXXXXXXXXXXXXXX', // Ganti dengan Client ID asli jika sudah ada
  slot = '1234567890',              // Ganti dengan Ad Slot ID asli jika sudah ada
  format = 'auto',
  responsive = true
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Google AdSense error:', err);
    }
  }, []);

  return (
    <div className={`adsense-container w-full overflow-hidden flex justify-center items-center bg-slate-100 rounded-xl min-h-[100px] border border-slate-200 border-dashed ${className}`}>
      {/* 
        Area ini mungkin akan terlihat kosong atau transparan 
        sampai domain dan akun AdSense sepenuhnya disetujui. 
      */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
