import { StringUtils } from './string.utils';
import { it, describe, expect } from 'vitest';

describe('StringUtils', () => {
  it('should be defined', () => {
    expect('a').toBeDefined();
  });

  describe('ilike', () => {
    it('should return true if a string is insensitive like another', () => {
      const sut = StringUtils.ILike('%D_PeDI_sp%', 'D_PEDI_SP');

      expect(sut).toBe(true);
    });

    it('should return false if a string is not insensitive like another', () => {
      const sut = StringUtils.ILike('%D_PEDI_mg%', 'D_PEDI_SP');

      expect(sut).toBe(false);
    });
  });

  describe('test', () => {
    it('should pass', () => {
      const fn = (dia: number, diasPosicao: number) =>
        dia === 1 || (dia - 1) % diasPosicao === 0;

      expect(fn(1, 30)).toBe(true);
      expect(fn(31, 30)).toBe(true);
      expect(fn(60, 30)).toBe(false);
      expect(fn(61, 30)).toBe(true);
    });
  });
});
