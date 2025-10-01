import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentPurchasesService } from './document-purchases.service';
import { CreateDocumentPurchaseDto } from './dto/create-document-purchase.dto';
import { UpdateDocumentPurchaseDto } from './dto/update-document-purchase.dto';
import { DeleteDocumentPurchasesDto } from './dto/delete-document-purchases.dto';
import { DocumentPurchase } from './entities/document-purchase.entity';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Документы покупки')
@Controller('document-purchases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentPurchasesController {
  constructor(
    private readonly documentPurchasesService: DocumentPurchasesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый документ покупки' })
  create(
    @Body() createDocumentPurchaseDto: CreateDocumentPurchaseDto,
    @Request() req: { user: User },
  ): Promise<DocumentPurchase> {
    const documentPurchaseData = {
      ...createDocumentPurchaseDto,
      authorId: req.user.id,
    };
    return this.documentPurchasesService.create(documentPurchaseData);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все документы покупки' })
  findAll(): Promise<DocumentPurchase[]> {
    return this.documentPurchasesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить документ покупки по ID' })
  @ApiParam({ name: 'id', description: 'ID документа покупки' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DocumentPurchase> {
    return this.documentPurchasesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить документ покупки' })
  @ApiParam({ name: 'id', description: 'ID документа покупки' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentPurchaseDto: UpdateDocumentPurchaseDto,
    @Request() req: { user: User },
  ): Promise<DocumentPurchase> {
    const documentPurchaseData = {
      ...updateDocumentPurchaseDto,
      authorId: req.user.id,
    };
    return this.documentPurchasesService.update(id, documentPurchaseData);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить несколько документов покупки' })
  deleteMany(
    @Body() deleteDocumentPurchasesDto: DeleteDocumentPurchasesDto,
  ): Promise<SuccessResponseDto> {
    return this.documentPurchasesService.deleteMany(
      deleteDocumentPurchasesDto.ids,
    );
  }

  @Post('restore')
  @ApiOperation({ summary: 'Восстановить несколько документов покупки' })
  recoveryMany(
    @Body() deleteDocumentPurchasesDto: DeleteDocumentPurchasesDto,
  ): Promise<SuccessResponseDto> {
    return this.documentPurchasesService.recoveryMany(
      deleteDocumentPurchasesDto.ids,
    );
  }
}
