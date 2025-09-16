import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ReadXlsxDto, XlsxReadResult, XlsxRowData } from './dto/read-xlsx.dto';

@Injectable()
export class XlsxReaderService {
  /**
   * Конвертирует Node.js Buffer в ArrayBuffer для ExcelJS
   */
  private convertBufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
  }

  /**
   * Безопасно преобразует значение ячейки в строку
   */
  private cellValueToString(value: unknown): string {
    if (value == null) {
      return '';
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    return JSON.stringify(value);
  }

  /**
   * Создает и загружает workbook из buffer
   */
  private async createWorkbook(buffer: Buffer): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = this.convertBufferToArrayBuffer(buffer);
    await workbook.xlsx.load(arrayBuffer);
    return workbook;
  }
  /**
   * Читает XLSX файл и возвращает данные в виде массива объектов
   * @param buffer - Buffer с содержимым XLSX файла
   * @param options - Опции для чтения файла
   * @returns XlsxReadResult
   */
  async readXlsxFile(
    buffer: Buffer,
    options: ReadXlsxDto = {},
  ): Promise<XlsxReadResult> {
    try {
      const workbook = await this.createWorkbook(buffer);
      const worksheet = this.getWorksheet(workbook, options.sheetName);
      const jsonData = this.extractWorksheetData(worksheet);

      if (jsonData.length === 0) {
        return this.createEmptyResult();
      }

      const { startRow, endRow } = this.calculateRowRange(
        options,
        jsonData.length,
      );
      const rowsToProcess = jsonData.slice(startRow - 1, endRow);
      const headers = this.extractHeaders(jsonData[0] || []);
      const columnMapping = this.createColumnMapping(headers, options.columns);

      const { data, errors } = this.processRows(
        rowsToProcess,
        columnMapping,
        startRow,
      );

      return {
        data,
        totalRows: jsonData.length,
        processedRows: data.length,
        errors,
      };
    } catch (error) {
      throw new BadRequestException(
        `Ошибка при чтении XLSX файла: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Получает worksheet по имени или первому доступному
   */
  private getWorksheet(
    workbook: ExcelJS.Workbook,
    sheetName?: string,
  ): ExcelJS.Worksheet {
    const targetSheetName = sheetName || workbook.worksheets[0]?.name;

    if (!targetSheetName) {
      throw new BadRequestException('Файл не содержит листов');
    }

    const worksheet = workbook.getWorksheet(targetSheetName);
    if (!worksheet) {
      throw new BadRequestException(
        `Лист "${targetSheetName}" не найден в файле`,
      );
    }

    return worksheet;
  }

  /**
   * Извлекает данные из worksheet в виде массива строк
   */
  private extractWorksheetData(worksheet: ExcelJS.Worksheet): string[][] {
    const jsonData: string[][] = [];

    worksheet.eachRow((row, rowNumber) => {
      const rowData: string[] = [];
      row.eachCell((cell, colNumber) => {
        rowData[colNumber - 1] = this.cellValueToString(cell.value);
      });
      jsonData[rowNumber - 1] = rowData;
    });

    return jsonData;
  }

  /**
   * Создает пустой результат
   */
  private createEmptyResult(): XlsxReadResult {
    return {
      data: [],
      totalRows: 0,
      processedRows: 0,
      errors: ['Файл пуст или не содержит данных'],
    };
  }

  /**
   * Вычисляет диапазон строк для обработки
   */
  private calculateRowRange(
    options: ReadXlsxDto,
    totalRows: number,
  ): { startRow: number; endRow: number } {
    return {
      startRow: options.startRow || 1,
      endRow: options.endRow || totalRows,
    };
  }

  /**
   * Обрабатывает строки данных
   */
  private processRows(
    rows: string[][],
    columnMapping: Record<string, number>,
    startRow: number,
  ): { data: XlsxRowData[]; errors: string[] } {
    const data: XlsxRowData[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      try {
        const rowData = this.parseRow(row, columnMapping);
        if (rowData) {
          data.push(rowData);
        }
      } catch (error) {
        errors.push(`Строка ${index + startRow}: ${(error as Error).message}`);
      }
    });

    return { data, errors };
  }

  /**
   * Извлекает заголовки из первой строки
   */
  private extractHeaders(firstRow: string[]): string[] {
    return firstRow.map(header =>
      header ? header.toString().trim().toLowerCase() : '',
    );
  }

  /**
   * Создает маппинг колонок
   */
  private createColumnMapping(
    headers: string[],
    customColumns?: string[],
  ): Record<string, number> {
    const mapping: Record<string, number> = {};

    if (customColumns && customColumns.length > 0) {
      // Используем пользовательские колонки
      customColumns.forEach((column, index) => {
        mapping[column.toLowerCase()] = index;
      });
    } else {
      // Автоматически определяем колонки по заголовкам
      headers.forEach((header, index) => {
        if (header) {
          mapping[header] = index;
        }
      });
    }

    return mapping;
  }

  /**
   * Парсит строку данных
   */
  private parseRow(
    row: string[],
    columnMapping: Record<string, number>,
  ): XlsxRowData | null {
    // Пропускаем пустые строки
    if (
      !row ||
      row.length === 0 ||
      row.every(cell => !cell || cell.trim() === '')
    ) {
      return null;
    }

    const rowData: Partial<XlsxRowData> = {};

    // Маппинг полей
    const fieldMappings = {
      name: ['название', 'name', 'товар', 'product', 'наименование'],
      description: ['описание', 'description', 'комментарий', 'comment'],
      price: ['цена', 'price', 'стоимость', 'cost', 'цена продажи'],
      category: ['категория', 'category', 'тип', 'type'],
      barcode: ['штрихкод', 'barcode', 'код', 'code', 'штрих-код'],
      quantity: ['количество', 'quantity', 'кол-во', 'amount', 'остаток'],
      unit: ['единица', 'unit', 'ед.изм', 'measure', 'единица хранения'],
      vendor: [
        'поставщик',
        'vendor',
        'производитель',
        'manufacturer',
        'основной поставщик',
      ],
      store: ['склад', 'store', 'магазин', 'shop'],
      currency: ['валюта', 'currency', 'вал'],
    };

    // Ищем соответствия для каждого поля
    Object.entries(fieldMappings).forEach(([field, possibleNames]) => {
      for (const name of possibleNames) {
        if (columnMapping[name] !== undefined) {
          const value = row[columnMapping[name]];
          if (value !== undefined && value !== '') {
            // Преобразуем значение в нужный тип
            if (field === 'price' || field === 'quantity') {
              const numValue = parseFloat(value.toString().replace(',', '.'));
              if (!isNaN(numValue)) {
                rowData[field] = numValue;
              }
            } else {
              rowData[field] = value.toString().trim();
            }
            break;
          }
        }
      }
    });

    // Проверяем обязательные поля
    if (!rowData.name) {
      throw new Error('Отсутствует обязательное поле "название"');
    }

    return rowData as XlsxRowData;
  }

  /**
   * Получает список листов из XLSX файла
   */
  async getSheetNames(buffer: Buffer): Promise<string[]> {
    try {
      const workbook = await this.createWorkbook(buffer);
      return workbook.worksheets.map(worksheet => worksheet.name);
    } catch (error) {
      throw new BadRequestException(
        `Ошибка при чтении структуры XLSX файла: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Получает информацию о листе
   */
  async getSheetInfo(
    buffer: Buffer,
    sheetName?: string,
  ): Promise<{
    sheetName: string;
    totalRows: number;
    totalColumns: number;
    headers: string[];
  }> {
    try {
      const workbook = await this.createWorkbook(buffer);
      const worksheet = this.getWorksheet(workbook, sheetName);

      const totalRows = worksheet.rowCount;
      const totalColumns = worksheet.columnCount;
      const headers = this.extractHeadersFromWorksheet(worksheet);

      return {
        sheetName: worksheet.name,
        totalRows,
        totalColumns,
        headers,
      };
    } catch (error) {
      throw new BadRequestException(
        `Ошибка при получении информации о листе: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Извлекает заголовки из первой строки worksheet
   */
  private extractHeadersFromWorksheet(worksheet: ExcelJS.Worksheet): string[] {
    const headers: string[] = [];

    if (worksheet.rowCount > 0) {
      const firstRow = worksheet.getRow(1);
      firstRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = this.cellValueToString(cell.value).trim();
      });
    }

    return headers;
  }
}
