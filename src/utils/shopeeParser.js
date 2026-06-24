import Papa from 'papaparse';

export const parseShopeeFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const extracted = results.data.map(row => {
          const gross = parseFloat(row['Product Price Paid by Buyer'] || row['Deal Price'] || 0);
          
          // Combine standard platform deductions
          const commFee = parseFloat(row['Commission Fee'] || 0);
          const serviceFee = parseFloat(row['Service Fee'] || 0);
          const transFee = parseFloat(row['Transaction Fee'] || 0);
          const totalFees = commFee + serviceFee + transFee;
          
          return {
            orderId: row['Order ID'] || 'N/A',
            productName: row['Product Name'] || 'Unknown Item',
            buyerPaidShipping: parseFloat(row['Shipping Fee Paid by Buyer'] || 0),
            estimatedShipping: parseFloat(row['Estimated Shipping Fee'] || 0),
            sellerPaidShipping: parseFloat(row['Seller Absorbed Shipping Fee'] || row['Actual Shipping Fee'] || 0),
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