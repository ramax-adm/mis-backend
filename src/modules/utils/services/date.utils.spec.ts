import { DateParseFormats, DateUtils } from './date.utils';
import { it, describe, expect } from 'vitest';

describe('Date Utils', () => {
  it('should be defined', () => {
    expect(DateUtils.today()).toBeDefined();
  });

  describe('Parse', () => {
    it('should be able to parse date using the cdz custom format', () => {
      const sut = DateUtils.parse('20241130', DateParseFormats.CDZ_FORMAT);

      expect(sut).toBeDefined();
      expect(sut).toEqual(new Date('2024-11-30T03:00:00.000Z'));
    });
  });

  describe('Sum Absolute Time', () => {
    it('should be able to sum positive and negative tmies', () => {
      const sut = DateUtils.reduceAbsoluteTime(['01:00:00', '-00:70:00']);

      expect(sut).toBeDefined();
      expect(sut).toEqual('-00:10:00');
    });
  });

  describe('Subtract Date', () => {
    it('should be able to subtract ', () => {
      const sut = DateUtils.subDate(new Date('2025-06-17'), {
        days: new Date('2025-06-17').getDate(),
        months: 12,
      });

      expect(sut).toEqual(new Date('2024-06-01'));
    });
  });
});
