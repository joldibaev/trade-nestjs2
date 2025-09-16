import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { DeleteCustomersDto } from './dto/delete-customers.dto';
import { Customer } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';

@ApiTags('Клиенты')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать нового клиента' })
  create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех клиентов' })
  findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить клиента по ID' })
  @ApiParam({ name: 'id', description: 'ID клиента' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<Customer> {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить клиента' })
  @ApiParam({ name: 'id', description: 'ID клиента' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить несколько клиентов' })
  deleteMany(
    @Body() deleteCustomersDto: DeleteCustomersDto,
  ): Promise<SuccessResponseDto> {
    return this.customersService.deleteMany(deleteCustomersDto.ids);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Восстановить несколько клиентов' })
  recoveryMany(
    @Body() deleteCustomersDto: DeleteCustomersDto,
  ): Promise<SuccessResponseDto> {
    return this.customersService.recoveryMany(deleteCustomersDto.ids);
  }
}
