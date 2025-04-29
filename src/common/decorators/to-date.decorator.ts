import { Transform } from 'class-transformer';

export function TransformToDate() {
  return Transform(({ value }) => {
    if (!value) return null;

    const date = new Date(value as string);
    return new Date(date.toISOString().split('T')[0] + 'T00:00:00');
  });
}
