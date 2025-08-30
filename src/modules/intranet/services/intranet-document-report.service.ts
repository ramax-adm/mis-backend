import { ExcelReaderService } from '@/core/services/excel-reader.service';
import { UserIntranetDocumentAcceptance } from '@/modules/user/entities/user-intranet-documents-acceptance.entity';
import { DateUtils } from '@/modules/utils/services/date.utils';
import { Injectable } from '@nestjs/common';
import { IntranetDocumentService } from './intranet-document.service';
import { IntranetDocument } from '../entities/intranet-document.entity';
import { IntranetDocumentVersion } from '../entities/intranet-document-version.entity';

@Injectable()
export class IntranetDocumentReportService {
  constructor(
    private readonly intranetDocumentService: IntranetDocumentService,
    private readonly excelReader: ExcelReaderService,
  ) {}

  getAcceptedDocumentsHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Aceito em'],
      ['B1', 'Usuario'],
      ['C1', 'Identificador'],
      ['D1', 'Documento'],
      ['E1', 'Tipo'],
      ['F1', 'Versão'],
      ['G1', 'Revisão'],
      ['H1', 'Tempo para aceitação (s)'],
    ];

    return headers;
  }

  getDocumentsHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Nome'],
      ['B1', 'Descrição'],
      ['C1', 'Tipo'],
    ];

    return headers;
  }

  getDocumentVersionsHeaders(): [string, any][] {
    const headers: [string, any][] = [
      ['A1', 'Identificador'],
      ['B1', 'Nome'],
      ['C1', 'Tipo'],
      ['D1', 'N° Revisão'],
      ['E1', 'Versão'],
    ];

    return headers;
  }

  getAcceptedDocumentsValues(
    dto: UserIntranetDocumentAcceptance[],
  ): [string, any][] {
    const values = [];

    const row = (i: number) => i + 2;
    dto.forEach((item, index) =>
      values.push(
        [`A${row(index)}`, DateUtils.format(item.createdAt, 'date')],
        [`B${row(index)}`, item.user.name],
        [`C${row(index)}`, item.documentVersion.key],
        [`D${row(index)}`, item.documentVersion.document.name],
        [`E${row(index)}`, item.documentVersion.document.type],
        [`F${row(index)}`, item.documentVersion.version],
        [`G${row(index)}`, item.documentVersion.reviewNumber],
        [`H${row(index)}`, item.acceptanceTimeInSeconds],
      ),
    );

    return values;
  }

  getDocumentsValues(dto: IntranetDocument[]): [string, any][] {
    const values = [];

    const row = (i: number) => i + 2;
    dto.forEach((item, index) =>
      values.push(
        [`A${row(index)}`, item.name],
        [`B${row(index)}`, item.description],
        [`C${row(index)}`, item.type],
      ),
    );

    return values;
  }

  getDocumentVersionsValues(dto: IntranetDocumentVersion[]): [string, any][] {
    const values = [];

    const row = (i: number) => i + 2;
    dto.forEach((item, index) =>
      values.push(
        [`A${row(index)}`, item.key],
        [`B${row(index)}`, item.document.name],
        [`C${row(index)}`, item.document.type],
        [`D${row(index)}`, item.reviewNumber],
        [`E${row(index)}`, item.version],
      ),
    );

    return values;
  }

  async export(userId: string) {
    this.excelReader.create();

    const [acceptedDocumentsData, documentsData, documentVersionsData] =
      await Promise.all([
        this.intranetDocumentService.getAcceptedDocuments(),
        this.intranetDocumentService.find(),
        this.intranetDocumentService.findDocumentVersions(),
      ]);

    // filtering
    const documentsWs = this.excelReader.addWorksheet(`Documentos`);
    const documentVersionsWs = this.excelReader.addWorksheet(
      `Versões de documentos`,
    );
    const acceptedDocumentsWs = this.excelReader.addWorksheet(
      `Relação de Documentos Aceitos`,
    );

    const acceptedDocumentsHeaders = this.getAcceptedDocumentsHeaders();
    acceptedDocumentsHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(acceptedDocumentsWs, cell, value);
    });
    const documentsHeaders = this.getDocumentsHeaders();
    documentsHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(documentsWs, cell, value);
    });

    const documentVersionsHeaders = this.getDocumentVersionsHeaders();
    documentVersionsHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(documentVersionsWs, cell, value);
    });

    const acceptedDocumentsValues = this.getAcceptedDocumentsValues(
      acceptedDocumentsData,
    );
    acceptedDocumentsValues.forEach(([cell, value]) => {
      this.excelReader.addData(acceptedDocumentsWs, cell, value);
    });

    const documentsValues = this.getDocumentsValues(documentsData);
    documentsValues.forEach(([cell, value]) => {
      this.excelReader.addData(documentsWs, cell, value);
    });

    const documentVersionsValues =
      this.getDocumentVersionsValues(documentVersionsData);
    documentVersionsValues.forEach(([cell, value]) => {
      this.excelReader.addData(documentVersionsWs, cell, value);
    });

    return await this.excelReader.toFile();
  }
}
