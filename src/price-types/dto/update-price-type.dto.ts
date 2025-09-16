import { PartialType } from '@nestjs/swagger';
import { CreatePriceTypeDto } from './create-price-type.dto';

export class UpdatePriceTypeDto extends PartialType(CreatePriceTypeDto) {}
