import * as XLSX from 'xlsx';

export const exportToDisputeExcel = (flaggedOrders, disputeType) => {
  let disputeData = [];

  if (disputeType === 'lost_returns') {
    disputeData = flaggedOrders.map(order => ({
      "Order ID": order.orderId,
      "Platform": order.platform,
      "Platform Status": "Returned / Delivered to Seller",
      "Warehouse Audit Status": "NOT RECEIVED IN WAREHOUSE",
      "Reason for Dispute": "Platform records claim package was delivered to seller, but no physical inbound warehouse scan exists.",
      "Expected Compensation": "Refund of original item value due to courier package loss."
    }));
  } 
  else if (disputeType === 'shipping_overcharges') {
    disputeData = flaggedOrders.map(order => ({
      "Order ID": order.orderId,
      "Product Name": order.productName,
      "Buyer Paid Shipping Fee": `₱${order.buyerPaidShipping.toFixed(2)}`,
      "System Charged Shipping Fee": `₱${order.estimatedShipping.toFixed(2)}`,
      "Overcharge Amount": `₱${(order.estimatedShipping - order.buyerPaidShipping).toFixed(2)}`,
      "Reason for Dispute": "System charged shipping fee exceeds the fee paid by the buyer. Requesting adjustment."
    }));
  } 
  else if (disputeType === 'rts_leakage') {
    disputeData = flaggedOrders.map(order => ({
      "Order ID": order.orderId,
      "Order Status": order.status,
      "Seller Charged Shipping": `₱${order.sellerPaidShipping.toFixed(2)}`,
      "Reason for Dispute": "Order is a Failed Delivery / RTS. Per policy, seller should not be penalized with shipping fees for courier failure.",
      "Expected Compensation": "Reimbursement of erroneously deducted shipping fees."
    }));
  } 
  else if (disputeType === 'commission_creep') {
    disputeData = flaggedOrders.map(order => ({
      "Order ID": order.orderId,
      "Gross Sales": `₱${order.grossSales.toFixed(2)}`,
      "Total Fees Deducted": `₱${order.totalFees.toFixed(2)}`,
      "Effective Fee Rate": `${(order.feeRate * 100).toFixed(2)}%`,
      "Reason for Dispute": "Effective platform fee rate exceeds baseline contract parameters. Requesting audit of active sub-program enrollments."
    }));
  }

  const worksheet = XLSX.utils.json_to_sheet(disputeData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Claims_Sheet");
  XLSX.writeFile(workbook, `${disputeType}_Dispute_Package.xlsx`);
};
