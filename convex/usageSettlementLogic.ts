export function conservativeAttemptSettlementCost(input: {
  usageKnown: boolean;
  actualCostUnits: number;
  reservedCostUnits?: number;
}) {
  const actual = Math.max(0, input.actualCostUnits);
  if (input.usageKnown) return actual;
  return Math.max(actual, Math.max(0, input.reservedCostUnits ?? 0));
}
