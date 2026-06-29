// This cleans strings like "₱1,250.00" or "1,250" into a standard number 1250
export const cleanCurrency = (val) => {
  if (!val) return 0;
  // Remove commas, currency symbols, and convert to float
  const sanitized = String(val).replace(/[,₱]/g, '').trim();
  return parseFloat(sanitized) || 0;
};
