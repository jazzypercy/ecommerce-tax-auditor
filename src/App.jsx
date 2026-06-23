import { useState } from 'react';
import { UploadCloud, Shield, CheckCircle, AlertTriangle, FileText, ShoppingBag, Box } from 'lucide-react';
import Papa from 'papaparse';
import { parseLazadaSingleFile } from './utils/lazadaParser';
import LazadaUploader from './components/LazadaUploader';
import ShopeeUploader from './components/ShopeeUploader';

export default function App() {
  const [shopeeData, setShopeeData] = useState(null);
  const [lazadaData, setLazadaData] = useState(null);
  const [shippingDiscrepancies, setShippingDiscrepancies] = useState([]);

  // --- Shopee Logic ---
  const handleShopeeUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const extracted = results.data.map(row => ({
          orderId: row['Order ID'] || 'N/A',
          productName: row['Product Name'] || 'Unknown Item',
          buyerPaidShipping: parseFloat(row['Shipping Fee Paid by Buyer'] || 0),
          estimatedShipping: parseFloat(row['Estimated Shipping Fee'] || 0),
        }));
        setShopeeData(extracted);
        setShippingDiscrepancies(extracted.filter(item => item.estimatedShipping > item.buyerPaidShipping));
      }
    });
  };

  // --- Lazada Logic ---
  const handleLazadaUpload = async (file) => {
    const data = await parseLazadaSingleFile(file);
    setLazadaData(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-orange-600" />
          <span className="font-bold text-xl tracking-tight">E-Com Auditor PH</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Shopee Module */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Shopee Audit Engine
            </h2>
            <ShopeeUploader onProcess={handleShopeeUpload} />
          </div>

          {/* Lazada Module */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5" /> Lazada Financial Audit
            </h2>
            <LazadaUploader onProcess={handleLazadaUpload} />
          </div>
        </div>

        {/* Results Sections */}
        {shopeeData && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Shopee Audit Summary ({shopeeData.length} orders)</h3>
            {shippingDiscrepancies.length > 0 ? (
                <div className="text-amber-700 bg-amber-50 p-4 rounded-lg font-medium">
                    Found {shippingDiscrepancies.length} shipping anomalies.
                </div>
            ) : <p className="text-emerald-600">No shipping leaks detected.</p>}
          </div>
        )}

        {lazadaData && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4">Lazada Transaction Summary ({lazadaData.length} records)</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead><tr className="text-left bg-slate-50 border-b"><th className="p-2">Order #</th><th className="p-2">Gross Sales</th><th className="p-2">Fees</th><th className="p-2">Net Payout</th></tr></thead>
                    <tbody>{lazadaData.slice(0,5).map((row, i) => (
                        <tr key={i} className="border-b">
                            <td className="p-2">{row.orderId}</td>
                            <td className="p-2">₱{row.grossSales.toFixed(2)}</td>
                            <td className="p-2 text-red-600">-₱{row.fees.toFixed(2)}</td>
                            <td className="p-2 font-bold">₱{row.netPayout.toFixed(2)}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}