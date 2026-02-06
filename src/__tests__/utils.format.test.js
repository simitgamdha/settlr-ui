import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../utils/format';

describe('formatCurrency', () => {
  it('formats numbers and strings as USD currency', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
    expect(formatCurrency('99.99')).toBe('$99.99');
  });

  it('returns $0.00 for non-numeric values', () => {
    expect(formatCurrency('abc')).toBe('$0.00');
    expect(formatCurrency(undefined)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats valid dates', () => {
    const date = new Date(2024, 0, 15, 12, 0, 0);
    expect(formatDate(date)).toBe('Jan 15');
  });

  it('returns empty string for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});
