import { useState } from 'react';
import { UploadCloud, Shield, CheckCircle, AlertTriangle, FileText, ShoppingBag, Box, Download } from 'lucide-react';
import Papa from 'papaparse';
import { parseLazadaSingleFile } from './utils/lazadaParser';
import { exportToExcel } from './utils/exportToExcel';
import LazadaUploader from './components/LazadaUploader';
import ShopeeUploader from './components/ShopeeUploader';
import InfoBar from './components/InfoBar';

export default function App() {
  const [shopeeData, setShopeeData] = useState(null);
  const [lazadaData, setLazadaData] = useState(null);
  const [shippingDiscrepancies, setShippingDiscrepancies] = useState([]);
  const [includeTax, setIncludeTax] = useState(false); // Tax state

  // --- Logic ---
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

  const handleLazadaUpload = async (file) => {
    const data = await parseLazadaSingleFile(file);
    setLazadaData(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-orange-600" />
          <span className="font-bold text-xl tracking-tight">Profit Guard PH</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Overview</h1>
        </div>

        {/* Informational Notice */}
        <InfoBar />

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
            <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50">
                <input type="checkbox" checked={includeTax} onChange={() => setIncludeTax(!includeTax)} />
                <span className="text-sm font-medium">Apply 1% Withholding Tax</span>
            </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5" /> Shopee Audit Engine
            </h2>
            <ShopeeUploader onProcess={handleShopeeUpload} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5" /> Lazada Audit Engine
            </h2>
            <LazadaUploader onProcess={handleLazadaUpload} />
          </div>
        </div>

        {/* Results */}
        {lazadaData && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Lazada Summary</h3>
                <button 
                    onClick={() => exportToExcel(lazadaData, 'Lazada_Audit')}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                    <Download className="w-4 h-4" /> Export to Excel
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead><tr className="text-left bg-slate-50 border-b"><th className="p-2">Order #</th><th className="p-2">Gross Sales</th><th className="p-2">Net Payout</th></tr></thead>
                    <tbody>{lazadaData.slice(0,5).map((row, i) => (
                        <tr key={i} className="border-b">
                            <td className="p-2">{row.orderId}</td>
                            <td className="p-2">₱{row.grossSales.toFixed(2)}</td>
                            <td className="p-2 font-bold text-blue-700">
                                ₱{(row.netPayout * (includeTax ? 0.99 : 1)).toFixed(2)}
                            </td>
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