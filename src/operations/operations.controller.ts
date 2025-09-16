import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { DeleteOperationsDto } from './dto/delete-operations.dto';
import { GetOperationsDto } from './dto/get-operations.dto';
import { Operation } from './entities/operation.entity';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Операции')
@Controller('operations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую операцию' })
  create(@Body() createOperationDto: CreateOperationDto): Promise<Operation> {
    return this.operationsService.create(createOperationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все операции' })
  findAll(@Query() getOperationsDto: GetOperationsDto): Promise<Operation[]> {
    return this.operationsService.findAll(getOperationsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить операцию по ID' })
  @ApiParam({ name: 'id', description: 'ID операции' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<Operation> {
    return this.operationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить операцию' })
  @ApiParam({ name: 'id', description: 'ID операции' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateOperationDto: UpdateOperationDto,
  ): Promise<Operation> {
    return this.operationsService.update(id, updateOperationDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить несколько операций' })
  deleteMany(
    @Body() deleteOperationsDto: DeleteOperationsDto,
  ): Promise<SuccessResponseDto> {
    return this.operationsService.deleteMany(deleteOperationsDto);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Восстановить несколько операций' })
  recoveryMany(
    @Body() deleteOperationsDto: DeleteOperationsDto,
  ): Promise<SuccessResponseDto> {
    return this.operationsService.recoveryMany(deleteOperationsDto);
  }
}
