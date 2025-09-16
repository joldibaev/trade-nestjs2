import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class XlsxRowData {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  store?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class ReadXlsxDto {
  @IsString()
  sheetName?: string;

  @IsNumber()
  startRow?: number = 1;

  @IsNumber()
  endRow?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  columns?: string[];
}

export class XlsxReadResult {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => XlsxRowData)
  data: XlsxRowData[];

  @IsNumber()
  totalRows: number;

  @IsNumber()
  processedRows: number;

  @IsArray()
  @IsString({ each: true })
  errors: string[];
}
