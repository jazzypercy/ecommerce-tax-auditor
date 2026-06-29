import Papa from 'papaparse';
import { cleanCurrency } from './parserUtils';

export const parseLazadaSingleFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // 1. Critical Error Handling
        if (results.errors.length > 0) {
          reject(new Error(`Lazada CSV Parse Error: ${results.errors[0].message}`));
          return;
        }

        const rows = results.data;
        
        // 2. Grouping by Order No.
        const summary = rows.reduce((acc, row) => {
          const orderId = row['Order No.'];
          if (!orderId) return acc;
          
          if (!acc[orderId]) {
            acc[orderId] = { 
              orderId, 
              grossSales: 0, 
              fees: 0, 
              netPayout: 0,
              platform: 'Lazada' 
            };
          }
          
          // Use our robust cleaner instead of parseFloat
          const amount = cleanCurrency(row['Amount']);
          const type = row['Transaction Type'];
          
          // Logic: If it's a sale, it's revenue. If it's a fee, it's a deduction.
          if (type === 'Orders-Sales') {
            acc[orderId].grossSales += amount;
          } else if (type === 'Orders-Lazada Fees') {
            acc[orderId].fees += Math.abs(amount); 
          }
          
          acc[orderId].netPayout += amount;
          return acc;
        }, {});

        // 3. Return the array
        resolve(Object.values(summary));
      },
      error: (err) => reject(err)
    });
  });
};
