import { Info } from 'lucide-react';

export default function InfoBar() {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 text-blue-900 rounded-r-lg shadow-sm">
      <div className="flex items-center gap-2 font-bold mb-2">
        <Info className="w-5 h-5 text-blue-600" />
        <span>Seller Tax & Audit Notice</span>
      </div>
      <ul className="text-sm space-y-2 list-disc list-inside">
        <li>
          <strong>Withholding Tax (BIR RR 16-2023):</strong> The 0.5% effective rate (1% of 50% gross remittance) is a creditable tax, not an extra expense. Ensure you secure your Form 2307 from the marketplace to claim this credit.
        </li>
        <li>
          <strong>Shipping Anomalies:</strong> Always compare the "Buyer Paid Shipping" against "Actual Shipping Cost." If the discrepancy is consistent, check if you need to adjust your weight/dimension settings in the Seller Center.
        </li>
        <li>
          <strong>Financial Hygiene:</strong> Regularly export your transaction reports to reconcile your actual bank deposits against the platform's "Net Payout" figures.
        </li>
      </ul>
      <p className="text-xs text-blue-700 mt-3 italic">
        Disclaimer: Profit Guard PH provides calculation aids based on platform data. This is not professional tax or legal advice. Always consult with a licensed CPA for your BIR filings.
      </p>
    </div>
  );
}
