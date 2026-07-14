export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-gutter py-margin-desktop max-w-container-max mx-auto">
        <div className="space-y-4">
          <span className="font-hanken text-2xl font-bold text-primary">GeoExtract</span>
          <p className="font-inter text-sm text-on-surface-variant">Precision Geospatial Solutions. Modern data mining for the intelligence era.</p>
        </div>
        <div>
          <h5 className="font-inter text-sm font-medium text-on-surface mb-4">Product</h5>
          <ul className="space-y-2">
            <li><a className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">API Docs</a></li>
            <li><a className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Pricing Plans</a></li>
            <li><a className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Bulk Extract</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-inter text-sm font-medium text-on-surface mb-4">Support</h5>
          <ul className="space-y-2">
            <li><a className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Help Center</a></li>
            <li><a className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Us</a></li>
            <li><a className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">System Status</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-inter text-sm font-medium text-on-surface mb-4">Legal</h5>
          <ul className="space-y-2">
            <li><a className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
            <li><a className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-outline-variant py-6">
        <div className="max-w-container-max mx-auto px-gutter text-center">
          <p className="font-inter text-xs text-on-surface-variant">© 2024 GeoExtract. All rights reserved. Precision Geospatial Solutions.</p>
        </div>
      </div>
    </footer>
  );
}
