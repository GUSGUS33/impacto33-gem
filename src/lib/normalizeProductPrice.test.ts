import { expect, it } from 'vitest';
import { normalizeProductPrice } from './normalizeProductPrice';
it('shares the previous decimal normalizer without truncating comma decimals', () => {
  expect(parseFloat('6,78')).toBe(6);
  expect(normalizeProductPrice('6,78')).toBe(6.78);
  expect(normalizeProductPrice('6.78')).toBe(6.78);
  expect(normalizeProductPrice('6,78 €')).toBe(6.78);
});
