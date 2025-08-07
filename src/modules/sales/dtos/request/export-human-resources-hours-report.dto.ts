import { InvoicesNfTypesEnum } from '../../enums/invoices-nf-types.enum';

export class ExportSalesInvoicesReportDto {
  filters: {
    companyCode: string;
    startDate?: Date;
    endDate?: Date;
    clientCode?: string;
    cfopCodes?: string;
    nfType?: InvoicesNfTypesEnum;
    nfNumber?: string;
    nfSituations?: string;
  };
}
