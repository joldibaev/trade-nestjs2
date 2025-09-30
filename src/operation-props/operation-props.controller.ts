import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OperationPropsService } from './operation-props.service';
import { CreateOperationPropsDto } from './dto/create-operation-props.dto';
import { UpdateOperationPropsDto } from './dto/update-operation-props.dto';

@ApiTags('operation-props')
@Controller('operation-props')
export class OperationPropsController {
  constructor(private readonly operationPropsService: OperationPropsService) {}

  @Post()
  create(@Body() createOperationPropsDto: CreateOperationPropsDto) {
    return this.operationPropsService.create(createOperationPropsDto);
  }

  @Get('operation/:operationId')
  findByOperationId(@Param('operationId', ParseUUIDPipe) operationId: string) {
    return this.operationPropsService.findByOperationId(operationId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOperationPropsDto: UpdateOperationPropsDto,
  ) {
    return this.operationPropsService.update(id, updateOperationPropsDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.operationPropsService.remove(id);
  }
}
