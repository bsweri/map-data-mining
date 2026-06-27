import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { MapPlace } from '../types';

interface ExportButtonProps {
  data: MapPlace[];
  keyword: string;
}

export default function ExportButton({ data, keyword }: ExportButtonProps) {
  const handleExport = () => {
    if (data.length === 0) return;

    // Persiapkan data untuk Excel
    const exportData = data.map((item, index) => ({
      No: index + 1,
      'Nama Lokasi / Tempat': item.name,
      'Alamat Lengkap': item.address,
      'No Telepon': item.phone || '-',
      'Zona Radius': item.radiusZone,
      'Link Google Maps': item.mapsLink,
    }));

    // Buat workbook & worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    // Setel lebar kolom biar rapi
    const wscols = [
      { wch: 5 },  // No
      { wch: 30 }, // Nama Lokasi
      { wch: 50 }, // Alamat
      { wch: 20 }, // No Telepon
      { wch: 15 }, // Zona Radius
      { wch: 45 }, // Link
    ];
    worksheet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Pencarian');

    // Generate filename
    const safeKeyword = keyword.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const fileName = `map_data_${safeKeyword || 'mining'}_${date}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);
  };

  if (data.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="mt-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ml-auto"
    >
      <Download size={18} />
      Export ke Excel
    </button>
  );
}
