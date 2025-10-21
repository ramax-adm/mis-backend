export class ExcelUtils {
  static timeStringToExcelNumber(timeString: string) {
    const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
    return hours / 24 + minutes / 1440 + seconds / 86400;
  }

  static getArrayOfExcelColumns() {
    return [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
      'AA',
      'AB',
      'AC',
      'AD',
      'AE',
      'AF',
      'AG',
      'AH',
      'AI',
      'AJ',
      'AK',
      'AL',
      'AM',
      'AN',
      'AO',
      'AP',
      'AQ',
      'AR',
      'AS',
      'AT',
      'AU',
      'AV',
      'AW',
      'AX',
      'AY',
      'AZ',
    ];
  }

  static getColumnIndex(position: number) {
    const indexes = this.getArrayOfExcelColumns();

    return indexes[position];
  }
}
