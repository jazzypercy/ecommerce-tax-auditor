import Papa from 'papaparse';
import { cleanCurrency } from './parserUtils';

export const parseShopeeFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // 1. Check for critical parsing errors
        if (results.errors.length > 0) {
          reject(new Error(`CSV Parse Error: ${results.errors[0].message}`));
          return;
        }

        // 2. Map data with sanitization
        const extracted = results.data.map(row => {
          const gross = cleanCurrency(row['Product Price Paid by Buyer'] || row['Deal Price']);
          
          // Clean the fees
          const commFee = cleanCurrency(row['Commission Fee']);
          const serviceFee = cleanCurrency(row['Service Fee']);
          const transFee = cleanCurrency(row['Transaction Fee']);
          const totalFees = commFee + serviceFee + transFee;
          
          return {
            orderId: row['Order ID'] || 'N/A',
            productName: row['Product Name'] || 'Unknown Item',
            buyerPaidShipping: cleanCurrency(row['Shipping Fee Paid by Buyer']),
            estimatedShipping: cleanCurrency(row['Estimated Shipping Fee']),
            sellerPaidShipping: cleanCurrency(row['Seller Absorbed Shipping Fee'] || row['Actual Shipping Fee']),
            status: row['Order Status'] || 'N/A',
            grossSales: gross,
            totalFees: totalFees,
            feeRate: gross > 0 ? (totalFees / gross) : 0,
            platform: 'Shopee'
          };
        });
        
        resolve(extracted);
      },
      error: (err) => reject(err)
    });
  });
};