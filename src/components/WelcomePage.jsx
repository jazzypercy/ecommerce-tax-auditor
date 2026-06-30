import { ShoppingBag, Box, ArrowRight } from 'lucide-react';

export default function WelcomePage({ onSelectPlatform }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center mb-12 max-w-2xl">
        <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide">
          E-COMMERCE AUDIT & TAX COMPLIANCE TOOL
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Profit Guard PH
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          Stop financial leakage. Automate your marketplace reconciliation and BIR compliance in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <button
          onClick={() => onSelectPlatform?.('shopee')}
          className="group bg-white border border-slate-200 rounded-2xl p-8 text-left shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-orange-300 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors">
            <ShoppingBag className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Shopee Seller Audit</h2>
          <p className="text-sm text-slate-500 mb-4">
            Reconcile shipping fees, RTS leakage, and commission creep from your Shopee statements.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 group-hover:gap-2 transition-all">
            Get Started <ArrowRight className="w-4 h-4" />
          </span>
        </button>

        <button
          onClick={() => onSelectPlatform?.('lazada')}
          className="group bg-white border border-slate-200 rounded-2xl p-8 text-left shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-blue-300 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
            <Box className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Lazada Seller Audit</h2>
          <p className="text-sm text-slate-500 mb-4">
            Sync your Lazada statement and verify net payouts against gross sales instantly.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
            Get Started <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
}