import { GetAnalyticalStockByCompanyResponseDto } from './stock-get-analytical-by-company-response.dto';
import { GetAnalyticalToExpiresByCompanyResponseDto } from './stock-get-analytical-to-expires-by-company-response.dto';

export class StockGetAnalyticalDataResponseDto {
  stockData: GetAnalyticalStockByCompanyResponseDto[];
  toExpiresData: GetAnalyticalToExpiresByCompanyResponseDto[];
  companyCode: string;
  companyName: string;
}
