import { Info, X, Download, ShieldAlert, BookOpen } from 'lucide-react';

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Platform Guide & Tax Info
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-600 text-sm">
          
          {/* INSTRUCTIONS SECTION */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" />
              How to Get Your Files
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                <h4 className="font-bold text-orange-800 mb-2">Shopee Sellers</h4>
                <ol className="list-decimal list-inside space-y-1 text-orange-900/80">
                  <li>Go to <strong>Shopee Seller Centre</strong>.</li>
                  <li>Click <strong>My Income</strong> on the sidebar.</li>
                  <li>Go to the <strong>Income Details</strong> tab.</li>
                  <li>Select your date range and click <strong>Export</strong>.</li>
                  <li>Download the resulting CSV file.</li>
                </ol>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <h4 className="font-bold text-blue-800 mb-2">Lazada Sellers</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-900/80">
                  <li>Go to <strong>Lazada Seller Center</strong>.</li>
                  <li>Navigate to <strong>Finance</strong> {'>'} <strong>Account Statement</strong>.</li>
                  <li>Select the statement period you want to audit.</li>
                  <li>Click the <strong>Export</strong> button.</li>
                  <li>Download the resulting CSV file.</li>
                </ol>
              </div>
            </div>

            <div className="mt-4 bg-purple-50 border border-purple-100 p-4 rounded-xl">
              <h4 className="font-bold text-purple-800 mb-2">Warehouse Return Log (Optional)</h4>
              <p className="text-purple-900/80">
                To check for "Lost Returns", upload your own internal Excel or CSV file. The only requirement is that it must contain a column titled exactly <strong>"Order ID"</strong> detailing the returns you have physically received.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* TAX & AUDIT SECTION */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Seller Tax & Audit Notice
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
                <p><strong>Withholding Tax (BIR RR 16-2023):</strong> The 0.5% effective rate (1% of 50% gross remittance) is a creditable tax, not an extra expense. Ensure you secure your Form 2307 from the marketplace to claim this credit.</p>
              </li>
              <li className="flex gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
                <p><strong>Shipping Anomalies:</strong> Always compare "Buyer Paid Shipping" against the "Actual Shipping Cost" deducted by the system. If the discrepancy is consistent, you likely have incorrect weight/dimension settings in your listings.</p>
              </li>
            </ul>
          </section>

        </div>

        {/* Sticky Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 italic">
            Disclaimer: Profit Guard PH provides calculation aids based on platform data. This is not professional tax or legal advice. Always consult with a licensed CPA.
          </p>
        </div>
      </div>
    </div>
  );
}
