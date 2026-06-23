import Papa from 'papaparse';

export const parseLazadaSingleFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        
        // Group everything by Order No.
        const summary = rows.reduce((acc, row) => {
          const orderId = row['Order No.'];
          if (!orderId) return acc;
          
          if (!acc[orderId]) {
            acc[orderId] = { orderId, grossSales: 0, fees: 0, netPayout: 0 };
          }
          
          const amount = parseFloat(row['Amount'] || 0);
          
          // Logic: If it's a sale, it's revenue. If it's a fee, it's a deduction.
          if (row['Transaction Type'] === 'Orders-Sales') {
            acc[orderId].grossSales += amount;
          } else if (row['Transaction Type'] === 'Orders-Lazada Fees') {
            acc[orderId].fees += Math.abs(amount); // Keep fees positive for display
          }
          
          acc[orderId].netPayout += amount;
          return acc;
        }, {});

        // Convert the object back into an array for the UI
        resolve(Object.values(summary));
      },
      error: (err) => reject(err)
    });
  });
};
