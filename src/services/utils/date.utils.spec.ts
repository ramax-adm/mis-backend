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
});
