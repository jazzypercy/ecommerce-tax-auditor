import { X, Sparkles } from 'lucide-react';

export default function BookkeepingGuide({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg text-slate-900">Seller Bookkeeping Guide 📖</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close guide"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
              1. Recording Daily Transactions
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Philippine BIR rules require sellers to log every sale as it happens — gross sales, platform deductions, and net payout — in a registered book of accounts or accounting software. Most small sellers use a simple columnar ledger: date, order ID, gross amount, fees, and net received.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
              2. Navigating Platform Deductions
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Shopee and Lazada deduct shipping fees, commissions, and program fees before payout. Track shipping fee overcharges (when the platform bills more than the buyer paid) and commission rates above your category baseline separately — both are common, disputable leakage points.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
              3. Preparing Records for Your Accountant
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Before handing off to a bookkeeper, organize raw exports into clean monthly summaries: total gross sales, total fees by category, confirmed returns, and net payout reconciled against your bank deposits. Clean inputs mean fewer billable hours untangling spreadsheets.
            </p>
          </section>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
            <Sparkles className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-900 leading-relaxed">
              <strong>Doing this manually takes 4–6 hours a week.</strong> Profit Guard PH automates the entire process — cross-referencing your warehouse inventory records with raw marketplace exports instantly, so you get audit-ready numbers in minutes, not hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
