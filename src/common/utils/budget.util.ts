/**
 * Shared budget parsing and formatting utility for PilotGov.
 * Normalizes diverse budget strings (e.g. "30L", "₹28L", "4500000", "₹1.2Cr")
 * into consistent Indian Rupee display formats ("₹30L", "₹1.2Cr").
 */

/**
 * Parses raw budget inputs into numeric Rupee values.
 * - Handles currency symbol ('₹'), commas, and whitespace.
 * - Supports 'L' / 'Lakh' (x100,000) and 'Cr' / 'Crore' (x10,000,000).
 * - Plain numbers without unit suffixes are treated as raw rupees.
 */
export function parseBudgetStringToRupees(
  raw?: string | number | null,
): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') {
    return isNaN(raw) || raw < 0 ? 0 : Math.round(raw);
  }

  const cleaned = raw.trim().replace(/,/g, '');
  if (!cleaned) return 0;

  const match = cleaned.match(
    /^₹?\s*([\d.]+)\s*(cr|crore|crores|l|lakh|lakhs|k|thousand)?$/i,
  );
  if (!match) return 0;

  const val = parseFloat(match[1]);
  if (isNaN(val) || val < 0) return 0;

  const unit = match[2]?.toLowerCase();
  if (unit === 'cr' || unit === 'crore' || unit === 'crores') {
    return Math.round(val * 10_000_000);
  }
  if (unit === 'l' || unit === 'lakh' || unit === 'lakhs') {
    return Math.round(val * 100_000);
  }
  if (unit === 'k' || unit === 'thousand') {
    return Math.round(val * 1_000);
  }

  return Math.round(val);
}

/**
 * Formats any raw budget input or numeric rupees into a standardized display string:
 * - Amounts < 1 Crore (>= 1 Lakh): "₹XL" (e.g. "₹30L", "₹45L", "₹28.5L")
 * - Amounts >= 1 Crore: "₹XCr" (e.g. "₹1.2Cr", "₹4Cr")
 * - Max 1 decimal place, omitting trailing .0
 */
export function formatBudget(raw?: string | number | null): string {
  if (raw === null || raw === undefined || raw === '') {
    return '₹0L';
  }

  const rupees =
    typeof raw === 'number' ? Math.round(raw) : parseBudgetStringToRupees(raw);

  if (isNaN(rupees) || rupees <= 0) {
    return '₹0L';
  }

  if (rupees >= 10_000_000) {
    const cr = rupees / 10_000_000;
    const rounded = Math.round(cr * 10) / 10;
    const formatted = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    return `₹${formatted}Cr`;
  }

  if (rupees >= 100_000) {
    const lakh = rupees / 100_000;
    const rounded = Math.round(lakh * 10) / 10;
    const formatted = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    return `₹${formatted}L`;
  }

  const lakh = rupees / 100_000;
  const rounded = Math.round(lakh * 10) / 10;
  if (rounded > 0) {
    return `₹${rounded.toFixed(1)}L`;
  }

  return `₹${rupees.toLocaleString('en-IN')}`;
}

/**
 * Alias for formatBudget to maintain backward compatibility with existing impact references.
 */
export const formatRupeesToDisplay = formatBudget;
