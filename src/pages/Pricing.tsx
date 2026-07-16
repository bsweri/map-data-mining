import Header from '../components/Header';
import PricingPackages from '../components/PricingPackages';
import Footer from '../components/Footer';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background text-on-background font-inter flex flex-col selection:bg-primary-container selection:text-white">
      <Header />
      
      <main className="pt-24 flex-grow px-gutter pb-16 max-w-container-max mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-primary font-bold text-xs uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
            Premium Plans
          </span>
          <h1 className="font-hanken text-4xl md:text-5xl font-bold text-on-background mt-4">
            Pilih Paket Terbaik untuk Bisnis Anda
          </h1>
          <p className="text-on-surface-variant mt-3 text-base">
            GeoExtract menyediakan solusi geospatial data mining terbaik untuk menunjang riset pasar dan ekspansi bisnis Anda.
          </p>
        </div>
        
        <PricingPackages />
      </main>

      <Footer />
    </div>
  );
}
