/**
 * Reconciliation Engine — Phase 1
 * O(n) performance using Map for warehouse lookup.
 */

export const DISCREPANCY_TYPES = {
  LOST_INVENTORY: 'LOST_INVENTORY',
  RET_MISMATCH: 'RET_MISMATCH',
};

export function reconcile(platformData, warehouseLog) {
  // Defensive: return empty array if either input is missing or empty
  if (!platformData?.length || !warehouseLog?.length) return [];

  // Build O(1) lookup Map from warehouse log: { orderId -> warehouseStatus }
  const warehouseMap = new Map(
    warehouseLog.map(entry => [
      (entry?.orderId ?? entry?.['Order ID'] ?? '').trim(),
      (entry?.status ?? '').trim().toLowerCase(),
    ])
  );

  const discrepancies = [];

  for (const order of platformData) {
    const orderId = (order?.orderId ?? '').trim();
    const platformStatus = (order?.status ?? '').trim().toLowerCase();

    if (!orderId || platformStatus !== 'delivered') continue;

    const warehouseStatus = warehouseMap.get(orderId); // undefined if not found

    if (warehouseStatus === undefined || warehouseStatus === 'lost') {
      discrepancies.push({
        ...order,
        discrepancyType: DISCREPANCY_TYPES.LOST_INVENTORY,
        warehouseStatus: warehouseStatus ?? 'not found',
      });
    } else if (warehouseStatus === 'returned') {
      discrepancies.push({
        ...order,
        discrepancyType: DISCREPANCY_TYPES.RET_MISMATCH,
        warehouseStatus,
      });
    }
  }

  return discrepancies;
}
