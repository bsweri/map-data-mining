export interface MapPlace {
  id: string;
  name: string;
  address: string;
  radiusZone: string;
  mapsLink: string;
  phone?: string;
  rating?: number;
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: any) => void;
    };
    adsbygoogle: any[];
  }
}
