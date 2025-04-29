export class NumberUtils {
  static cnpjMask(v: string) {
    v = v.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    return v;
  }

  static cpfMask(v: string) {
    v = v.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
  }

  static isLessOrEqualThan(number: number, numberToCompare: number) {
    return (
      this.isLessThan(number, numberToCompare) ||
      this.nequal(number, numberToCompare)
    );
  }

  static isLessThan(number: number, numberToCompare: number) {
    return number < numberToCompare - 0.00001;
  }

  static nequal(a: number, b: number) {
    return Math.abs(a - b) < 0.01;
  }

  static nb8(value: number) {
    return Number(value.toFixed(8));
  }

  static nb4(value: number) {
    return Number(value.toFixed(4));
  }

  static nb2(value: number) {
    return Number(value.toFixed(2));
  }

  static nb0(value: number) {
    return Number(value.toFixed(0));
  }

  static toString(value?: number, defaultValue = 'Não Informado') {
    if (!value && value !== 0) return defaultValue;
    return value.toString();
  }

  static toPercent(value: number) {
    return value ? `${this.nb2(value * 100)}%` : '0%';
  }

  static toMoney(value?: number) {
    return Intl.NumberFormat('pt-br', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  }

  static toLocaleString(value: number, nb: number = 0) {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: nb,
      maximumFractionDigits: nb,
    });
  }

  static isValidPositiveInteger(number: number) {
    return Number.isInteger(number) && number > 0;
  }
}
