import { useState, useEffect } from 'react';
import { Shield, Box, Download, AlertTriangle, ClipboardList, FileSpreadsheet, Info } from 'lucide-react';
import Papa from 'papaparse';
import { parseLazadaSingleFile } from './utils/lazadaParser';
import { parseShopeeFile } from './utils/shopeeParser';
import { exportToExcel } from './utils/exportToExcel';
import { exportToDisputeExcel } from './utils/exportToDispute';
import LazadaUploader from './components/LazadaUploader';
import ShopeeUploader from './components/ShopeeUploader';
import InfoModal from './components/InfoModal';
import { reconcile } from './utils/reconciler';
const [showWarehouseLog, setShowWarehouseLog] = useState(false);

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shopeeData, setShopeeData] = useState(null);
  const [lazadaData, setLazadaData] = useState(null);
  const [warehouseLog, setWarehouseLog] = useState(null);
  
  // Auditing / Leakage States
  const [shippingDiscrepancies, setShippingDiscrepancies] = useState([]);
  const [lostReturns, setLostReturns] = useState([]);
  const [rtsLeakage, setRtsLeakage] = useState([]);
  const [commissionCreep, setCommissionCreep] = useState([]);
  const [includeTax, setIncludeTax] = useState(false);
  const [reconciliationResults, setReconciliationResults] = useState([]);

  // --- POLYMORPHIC INPUT EXTRACTOR ---
  // Safely handles either raw File objects or standard HTML browser Events
  const extractFile = (input) => {
    if (!input) return null;
    if (input.target && input.target.files) {
      return input.target.files[0]; // Extracted from DOM Event
    }
    return input; // Already a raw File object
  };

  // --- Parse Shopee File ---
  const handleShopeeUpload = async (input) => {
    const file = extractFile(input);
    if (!file) return;

    try {
      const extracted = await parseShopeeFile(file);
      setShopeeData(extracted);
    } catch (err) {
      console.error("Error parsing Shopee CSV: ", err);
    }
  };

  // --- Parse Lazada File ---
  const handleLazadaUpload = async (input) => {
    const file = extractFile(input);
    if (!file) return;

    try {
      const data = await parseLazadaSingleFile(file);
      const normalizedData = data.map(item => ({
        ...item,
        platform: 'Lazada',
        status: item.status || 'Returned' 
      }));
      setLazadaData(normalizedData);
    } catch (err) {
      console.error("Error parsing Lazada CSV: ", err);
    }
  };

  // --- Parse Internal Warehouse Log ---
  const handleWarehouseLogUpload = (event) => {
    const file = extractFile(event);
    if (!file) return;

    Papa.parse(file, {
      header: true, 
      skipEmptyLines: true,
      complete: (results) => {
        const inboundIds = results.data.map(row => (row['Order ID'] || '').trim());
        setWarehouseLog(inboundIds); 
      }
    });
  };

  // --- DECLARATIVE AUDITING & RECONCILIATION ENGINE ---
  useEffect(() => {
    // 1. Process Shopee Leakage Metrics Reactively
    if (shopeeData) {
      setShippingDiscrepancies(shopeeData.filter(item => item.estimatedShipping > item.buyerPaidShipping && (item.status || '') !== 'Cancelled'));
      setRtsLeakage(shopeeData.filter(item => ((item.status || '').includes('Cancel') || (item.status || '').includes('Delivery Failed')) && item.sellerPaidShipping > 0));
      setCommissionCreep(shopeeData.filter(item => item.feeRate > 0.105));
    } else {
      // Clear charts if Shopee file is wiped
      setShippingDiscrepancies([]);
      setRtsLeakage([]);
      setCommissionCreep([]);
    }
    
    // 2. Cross-Match Discrepancies with Warehouse Logs
    if (!warehouseLog || warehouseLog.length === 0) {
      setLostReturns([]);
      return;
    }

    const crossMatch = [];
    const receivedSet = new Set(warehouseLog);

    // Cross Match Shopee Anomalies
    if (shopeeData) {
      shopeeData.forEach(item => {
        const statusClean = item.status || '';
        if ((statusClean.includes('Return') || statusClean.includes('Refund')) && !receivedSet.has(item.orderId)) {
          crossMatch.push(item);
        }
      });
    }

    // Cross Match Lazada Anomalies
    if (lazadaData) {
      lazadaData.forEach(item => {
        const statusClean = item.status || '';
        if (statusClean.includes('Return') && !receivedSet.has(item.orderId)) {
          crossMatch.push(item);
        }
      });
    }

    setLostReturns(crossMatch);

  }, [shopeeData, lazadaData, warehouseLog]);

  useEffect(() => {
    // Combine both platform datasets defensively
    const combined = [
      ...(shopeeData ?? []),
      ...(lazadaData ?? []),
    ];

    const results = reconcile(combined, warehouseLog ?? []);
    setReconciliationResults(results);
  }, [shopeeData, lazadaData, warehouseLog]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Pop-up Modal Component */}
      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-orange-600" /> {/* Kept your theme orange-600 here */}
          <span className="font-bold text-xl tracking-tight">Profit Guard PH</span>
        </div>
        
        {/* NEW: Guide & Instructions Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors"
        >
          <Info className="w-4 h-4" />
          How to Use Guide
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">Leakage & Overcharge Audit</h1>
        </div>

        <div className="flex items-center justify-between mb-8">
            <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50">
                <input type="checkbox" checked={includeTax} onChange={() => setIncludeTax(!includeTax)} />
                <span className="text-sm font-medium">Apply 1% Withholding Tax Context</span>
            </label>
        </div>

        {/* Audit Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5" /> 1. Shopee CSV Statement
            </h2>
            <ShopeeUploader onProcess={handleShopeeUpload} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5" /> 2. Lazada CSV Statement
            </h2>
            <LazadaUploader onProcess={handleLazadaUpload} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-purple-700 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> 3. Warehouse Return Log
              </h2>
              <button
                onClick={() => setShowWarehouseLog(!showWarehouseLog)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  showWarehouseLog
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {showWarehouseLog ? 'Enabled ✓' : 'Enable'}
              </button>
            </div>

            {showWarehouseLog && (
              <div className="border-t border-slate-100 pt-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleWarehouseLogUpload}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                />
                <p className="text-xs text-slate-500 mt-2">Upload your clean CSV containing a column titled "Order ID" to verify receiving.</p>
              </div>
            )}

            {!showWarehouseLog && (
              <p className="text-xs text-slate-400 italic">Enable to cross-match returns against your warehouse inbound log.</p>
            )}
          </div>

        {/* LEAKAGE MODULE 1: Lost Return Tracker Results */}
        {lostReturns.length > 0 && (
          <div className="bg-white rounded-xl border-l-4 border-l-purple-600 border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-purple-950 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-purple-600" /> Lost Returns Found ({lostReturns.length})
                  </h3>
                  <p className="text-sm text-slate-500">Items marked as delivered back to you by couriers, but completely missing from your warehouse inbound logs.</p>
                </div>
                <button 
                    onClick={() => exportToDisputeExcel(lostReturns, 'lost_returns')}
                    className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors shrink-0"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Download Dispute-Ready Package
                </button>
            </div>
            <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
                <table className="w-full text-sm">
                    <thead><tr className="text-left bg-slate-50 border-b"><th className="p-2">Order ID</th><th className="p-2">Channel</th><th className="p-2">Dispute Status</th></tr></thead>
                    <tbody>{lostReturns.map((row) => (
                        <tr key={row.orderId} className="border-b hover:bg-slate-50">
                            <td className="p-2 font-mono text-xs">{row.orderId}</td>
                            <td className="p-2 text-xs"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${row.platform === 'Shopee' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>{row.platform}</span></td>
                            <td className="p-2 text-xs text-red-600 font-medium italic">Unresolved Leakage</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
          </div>
        )}

        {/* LEAKAGE MODULE 2: Shopee Shipping Overcharges */}
        {shippingDiscrepancies.length > 0 && (
          <div className="bg-white rounded-xl border-l-4 border-l-orange-500 border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-orange-950 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" /> Shipping Fee Overcharges ({shippingDiscrepancies.length})
                  </h3>
                  <p className="text-sm text-slate-500">System generated shipping fees calculated by Shopee that exceed what the customer was actually billed.</p>
                </div>
                <button 
                    onClick={() => exportToDisputeExcel(shippingDiscrepancies, 'shipping_overcharges')}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shrink-0"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Download Overcharge Claims Sheet
                </button>
            </div>
            <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
                <table className="w-full text-sm">
                    <thead><tr className="text-left bg-slate-50 border-b"><th className="p-2">Order ID</th><th className="p-2">Buyer Paid</th><th className="p-2">System Charged</th><th className="p-2">Seller Leakage</th></tr></thead>
                    <tbody>{shippingDiscrepancies.slice(0, 10).map((row) => (
                        <tr key={row.orderId} className="border-b hover:bg-slate-50">
                            <td className="p-2 font-mono text-xs">{row.orderId}</td>
                            <td className="p-2 text-xs">₱{(row.buyerPaidShipping || 0).toFixed(2)}</td>
                            <td className="p-2 text-xs text-red-500 font-semibold">₱{(row.estimatedShipping || 0).toFixed(2)}</td>
                            <td className="p-2 text-xs font-bold text-red-700">₱{((row.estimatedShipping || 0) - (row.buyerPaidShipping || 0)).toFixed(2)}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
          </div>
        )}

        {/* LEAKAGE MODULE 3: RTS Shipping Leakage Tracker */}
        {rtsLeakage.length > 0 && (
          <div className="bg-white rounded-xl border-l-4 border-l-rose-600 border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-rose-950 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" /> RTS Failed-Delivery Leakage ({rtsLeakage.length})
                  </h3>
                  <p className="text-sm text-slate-500">Platform deducted shipping charges on failed deliveries or buyer cancellations. These are highly disputable.</p>
                </div>
                <button 
                    onClick={() => exportToDisputeExcel(rtsLeakage, 'rts_leakage')}
                    className="flex items-center gap-2 bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-800 transition-colors shrink-0"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Download RTS Claims Sheet
                </button>
            </div>
            <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
                <table className="w-full text-sm">
                    <thead><tr className="text-left bg-slate-50 border-b"><th className="p-2">Order ID</th><th className="p-2">System Status</th><th className="p-2">Deducted Shipping</th></tr></thead>
                    <tbody>{rtsLeakage.slice(0, 10).map((row) => (
                        <tr key={row.orderId} className="border-b hover:bg-slate-50">
                            <td className="p-2 font-mono text-xs">{row.orderId}</td>
                            <td className="p-2 text-xs text-slate-600 font-medium">{row.status}</td>
                            <td className="p-2 text-xs font-bold text-rose-600">₱{(row.sellerPaidShipping || 0).toFixed(2)}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
          </div>
        )}

        {/* LEAKAGE MODULE 4: Commission Creep & Sub-Program Auditor */}
        {commissionCreep.length > 0 && (
          <div className="bg-white rounded-xl border-l-4 border-l-amber-500 border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-amber-950 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" /> Hidden Program Fee / Commission Creep ({commissionCreep.length})
                  </h3>
                  <p className="text-sm text-slate-500">Orders where total platform fees exceed a 10.5% baseline threshold. Review active Cashback or Free Shipping program enrollments.</p>
                </div>
                <button 
                    onClick={() => exportToDisputeExcel(commissionCreep, 'commission_creep')}
                    className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shrink-0"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Download Commission Audit Sheet
                </button>
            </div>
            <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
                <table className="w-full text-sm">
                    <thead><tr className="text-left bg-slate-50 border-b"><th className="p-2">Order ID</th><th className="p-2">Gross Sale</th><th className="p-2">Total Fees</th><th className="p-2">Effective Cut</th></tr></thead>
                    <tbody>{commissionCreep.slice(0, 10).map((row) => (
                        <tr key={row.orderId} className="border-b hover:bg-slate-50">
                            <td className="p-2 font-mono text-xs">{row.orderId}</td>
                            <td className="p-2 text-xs">₱{(row.grossSales || 0).toFixed(2)}</td>
                            <td className="p-2 text-xs text-slate-600">₱{(row.totalFees || 0).toFixed(2)}</td>
                            <td className="p-2 text-xs font-bold text-amber-700">{((row.feeRate || 0) * 100).toFixed(1)}%</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
          </div>
        )}

        {reconciliationResults.length > 0 && (
          <div className="bg-white rounded-xl border-l-4 border-l-rose-600 border border-slate-200 shadow-sm p-6 mb-8">
            <div className="mb-4">
              <h3 className="font-bold text-lg text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Reconciliation Flags ({reconciliationResults.length})
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Orders marked <strong>Delivered</strong> by the platform but missing or mismatched in your warehouse log.
              </p>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-100 rounded-lg">
              <table className="w-full text-sm" role="table" aria-label="Reconciliation discrepancies">
                <thead>
                  <tr className="text-left bg-rose-50 border-b border-rose-100">
                    <th className="p-2 font-semibold text-rose-800">Order ID</th>
                    <th className="p-2 font-semibold text-rose-800">Platform</th>
                    <th className="p-2 font-semibold text-rose-800">Platform Status</th>
                    <th className="p-2 font-semibold text-rose-800">Warehouse Status</th>
                    <th className="p-2 font-semibold text-rose-800">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliationResults.map((row) => (
                    <tr key={`${row.orderId}-${row.discrepancyType}`} className="border-b hover:bg-rose-50 transition-colors">
                      <td className="p-2 font-mono text-xs">{row.orderId}</td>
                      <td className="p-2 text-xs">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          row.platform === 'Shopee'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {row.platform ?? '—'}
                        </span>
                      </td>
                      <td className="p-2 text-xs text-slate-600 capitalize">{row.status}</td>
                      <td className="p-2 text-xs text-slate-600 capitalize">{row.warehouseStatus}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          row.discrepancyType === 'LOST_INVENTORY'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {row.discrepancyType === 'LOST_INVENTORY' ? '⚠ Lost Inventory' : '↩ Return Mismatch'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Overview Table */}
        {lazadaData && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Lazada Base Audit Sync</h3>
                <button 
                    onClick={() => exportToExcel(lazadaData, 'Lazada_Audit')}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                    <Download className="w-4 h-4" /> Export Master Reconciliation
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead><tr className="text-left bg-slate-50 border-b"><th className="p-2">Order #</th><th className="p-2">Gross Sales</th><th className="p-2">Net Payout</th></tr></thead>
                    <tbody>{lazadaData.slice(0,5).map((row) => (
                        <tr key={row.orderId} className="border-b">
                            <td className="p-2 font-mono text-xs">{row.orderId}</td>
                            <td className="p-2 text-xs">₱{(row.grossSales || 0).toFixed(2)}</td>
                            <td className="p-2 text-xs font-bold text-blue-700">
                                ₱{((row.netPayout || 0) * (includeTax ? 0.99 : 1)).toFixed(2)}
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
