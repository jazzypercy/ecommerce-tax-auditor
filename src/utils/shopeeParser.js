import Papa from 'papaparse';

export const parseShopeeFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map(row => ({
          orderId: row['Order ID'],
          product: row['Product Name'],
          // Financial Math
          buyerPaidShipping: parseFloat(row['Shipping Fee Paid by Buyer'] || 0),
          estimatedShipping: parseFloat(row['Estimated Shipping Fee'] || 0),
          netPayout: parseFloat(row['Net Payout'] || 0),
          // The "Leakage" logic for your audit
          shippingLeak: parseFloat(row['Estimated Shipping Fee'] || 0) - parseFloat(row['Shipping Fee Paid by Buyer'] || 0)
        }));
        resolve(data);
      },
      error: (err) => reject(err)
    });
  });
};
