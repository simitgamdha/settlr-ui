import { describe, it, expect } from 'vitest';
import { cn } from '../utils/cn';

describe('cn', () => {
  it('merges class names and removes falsy values', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('merges tailwind class conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
