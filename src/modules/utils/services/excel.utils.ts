export class ExcelUtils {
  static timeStringToExcelNumber(timeString: string) {
    const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
    return hours / 24 + minutes / 1440 + seconds / 86400;
  }
}
