import { Injectable } from '@nestjs/common';
import { Workbook, Worksheet } from 'exceljs';

@Injectable()
export class ExcelReaderService {
  private workbook: Workbook;

  constructor() {}

  create() {
    const workbook = new Workbook();
    this.workbook = workbook;
  }

  addData(worksheet: Worksheet, cell: string, value: any) {
    worksheet.getCell(cell).value = value;
  }

  addWorksheet(name: string) {
    const worksheet = this.workbook.addWorksheet(name, {});
    return worksheet;
  }

  getWorksheet(name: string) {
    return this.workbook.getWorksheet(name);
  }

  async toFile() {
    return await this.workbook.xlsx.writeBuffer();
  }
}
