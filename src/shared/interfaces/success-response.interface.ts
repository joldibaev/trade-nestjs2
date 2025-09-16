import { ApiProperty } from '@nestjs/swagger';

export interface SuccessResponse {
  success: boolean;
}

export class SuccessResponseDto implements SuccessResponse {
  @ApiProperty({
    description: 'Флаг успешности операции',
    example: true,
  })
  success: boolean;

  constructor(success: boolean = true) {
    this.success = success;
  }
}
