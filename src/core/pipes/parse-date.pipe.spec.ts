import { describe, expect, it } from 'vitest';
import { ParseDatePipe } from './parse-date.pipe';
import { BadRequestException } from '@nestjs/common';

describe('ParseDatePipe', () => {
  it('should be transform a valid date', () => {
    const pipe = new ParseDatePipe();
    const validDate = '2025-02-21';
    const output = pipe.transform(validDate);
    expect(output.getDate()).toBe(21);
    expect(output.getMonth()).toBe(1);
    expect(output.getFullYear()).toBe(2025);
    expect(output.getHours()).toBe(0);
  });

  it('should be throw a error when has a invalid date as input', () => {
    const pipe = new ParseDatePipe();
    const invalidDate = '2025-40-21';
    expect(() => pipe.transform(invalidDate)).toThrow(BadRequestException);
  });
});
