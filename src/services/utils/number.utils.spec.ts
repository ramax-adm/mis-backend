import { NumberUtils } from './number.utils';
import { it, describe, expect } from 'vitest';

describe('NumberUtils', () => {
  it('should be defined', () => {
    expect(1 + 1).toBeDefined();
  });

  describe('is less', () => {
    it('should return true if a number is less than another', () => {
      const sut = NumberUtils.isLessThan(10, 11);
      expect(sut).toBe(true);

      const sut2 = NumberUtils.isLessThan(10.99, 11);
      expect(sut2).toBe(true);

      const sut3 = NumberUtils.isLessThan(10.9999, 11);
      expect(sut3).toBe(true);
    });

    it('should return false if a number is not less than another', () => {
      const sut = NumberUtils.isLessThan(11.01, 11);
      expect(sut).toBe(false);

      const sut2 = NumberUtils.isLessThan(11.0001, 11);
      expect(sut2).toBe(false);
    });
  });

  describe('is less or equal', () => {
    it('should return true if a number is less or equal than another', () => {
      const sut = NumberUtils.isLessOrEqualThan(10, 11);
      expect(sut).toBe(true);

      const sut2 = NumberUtils.isLessOrEqualThan(10.99, 11);
      expect(sut2).toBe(true);

      const sut3 = NumberUtils.isLessOrEqualThan(10.9999, 11);
      expect(sut3).toBe(true);

      const sut4 = NumberUtils.isLessOrEqualThan(11.0, 11);
      expect(sut4).toBe(true);

      const sut5 = NumberUtils.isLessOrEqualThan(11.9999, 11.9999);
      expect(sut5).toBe(true);
    });

    it('should return false if a number is not less or equal than another', () => {
      const sut = NumberUtils.isLessOrEqualThan(11.1, 11);
      expect(sut).toBe(false);

      const sut2 = NumberUtils.isLessOrEqualThan(11.2, 11);
      expect(sut2).toBe(false);

      const sut3 = NumberUtils.isLessOrEqualThan(11.12, 11.0001);
      expect(sut3).toBe(false);
    });
  });

  describe('isValidInteger', () => {
    it('should return true for a positive integer', () => {
      expect(NumberUtils.isValidPositiveInteger(950)).toBe(true);
    });

    it('should return false for a non-integer (e.g., float)', () => {
      expect(NumberUtils.isValidPositiveInteger(3.14)).toBe(false);
    });

    it('should return false for zero or negative integers', () => {
      expect(NumberUtils.isValidPositiveInteger(0)).toBe(false);
      expect(NumberUtils.isValidPositiveInteger(-10)).toBe(false);
    });
  });
});
