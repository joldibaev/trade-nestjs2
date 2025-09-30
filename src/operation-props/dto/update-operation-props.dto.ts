import { PartialType } from '@nestjs/swagger';
import { CreateOperationPropsDto } from './create-operation-props.dto';

export class UpdateOperationPropsDto extends PartialType(
  CreateOperationPropsDto,
) {}
