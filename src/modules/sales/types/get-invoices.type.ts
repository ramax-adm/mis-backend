import { Invoice } from '../entities/invoice.entity';
import { ReturnOccurrence } from '../entities/return-occurrence.entity';

export type GetInvoicesItem = Invoice & { companyName: string };

export type GetReturnOccurrenceItem = ReturnOccurrence;
