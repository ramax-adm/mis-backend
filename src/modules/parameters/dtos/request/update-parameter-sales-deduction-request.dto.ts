import { PartialType } from '@nestjs/swagger';
import { CreateParameterSalesDeductionRequestDto } from './create-parameter-sales-deduction-request.dto';

export class UpdateParameterSalesDeductionRequestDto extends PartialType(
  CreateParameterSalesDeductionRequestDto,
) {}
