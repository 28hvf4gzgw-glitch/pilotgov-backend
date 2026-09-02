import { formatBudget, parseBudgetStringToRupees } from './budget.util';

describe('budget.util', () => {
  describe('parseBudgetStringToRupees', () => {
    it('should parse Lakh representations correctly', () => {
      expect(parseBudgetStringToRupees('30L')).toBe(3_000_000);
      expect(parseBudgetStringToRupees('₹28L')).toBe(2_800_000);
      expect(parseBudgetStringToRupees('₹40L')).toBe(4_000_000);
      expect(parseBudgetStringToRupees('50 Lakh')).toBe(5_000_000);
      expect(parseBudgetStringToRupees('50 Lakhs')).toBe(5_000_000);
      expect(parseBudgetStringToRupees('12.5L')).toBe(1_250_000);
    });

    it('should parse Crore representations correctly', () => {
      expect(parseBudgetStringToRupees('1.2Cr')).toBe(12_000_000);
      expect(parseBudgetStringToRupees('₹1.2Cr')).toBe(12_000_000);
      expect(parseBudgetStringToRupees('2 Crore')).toBe(20_000_000);
      expect(parseBudgetStringToRupees('₹3.5 Crores')).toBe(35_000_000);
    });

    it('should parse plain numbers in rupees', () => {
      expect(parseBudgetStringToRupees('4500000')).toBe(4_500_000);
      expect(parseBudgetStringToRupees('12000000')).toBe(12_000_000);
      expect(parseBudgetStringToRupees(4500000)).toBe(4_500_000);
    });

    it('should handle zero, empty, or invalid inputs gracefully', () => {
      expect(parseBudgetStringToRupees('')).toBe(0);
      expect(parseBudgetStringToRupees(null)).toBe(0);
      expect(parseBudgetStringToRupees(undefined)).toBe(0);
      expect(parseBudgetStringToRupees('invalid')).toBe(0);
    });
  });

  describe('formatBudget', () => {
    it('should normalize varied Lakh inputs to consistent ₹XL format', () => {
      expect(formatBudget('30L')).toBe('₹30L');
      expect(formatBudget('₹28L')).toBe('₹28L');
      expect(formatBudget('4500000')).toBe('₹45L');
      expect(formatBudget('₹40L')).toBe('₹40L');
      expect(formatBudget('50 Lakh')).toBe('₹50L');
      expect(formatBudget('28.5L')).toBe('₹28.5L');
      expect(formatBudget('28.0L')).toBe('₹28L');
    });

    it('should normalize Crore inputs to consistent ₹XCr format', () => {
      expect(formatBudget('1.2Cr')).toBe('₹1.2Cr');
      expect(formatBudget('₹1.2Cr')).toBe('₹1.2Cr');
      expect(formatBudget('12000000')).toBe('₹1.2Cr');
      expect(formatBudget('2 Crore')).toBe('₹2Cr');
      expect(formatBudget('₹1.0Cr')).toBe('₹1Cr');
    });

    it('should handle zero or empty inputs', () => {
      expect(formatBudget('')).toBe('₹0L');
      expect(formatBudget(null)).toBe('₹0L');
      expect(formatBudget(undefined)).toBe('₹0L');
      expect(formatBudget('0')).toBe('₹0L');
    });
  });
});
