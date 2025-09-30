import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationProps } from './entities/operation-props.entity';
import { OperationPropsService } from './operation-props.service';
import { OperationPropsController } from './operation-props.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OperationProps])],
  controllers: [OperationPropsController],
  providers: [OperationPropsService],
  exports: [OperationPropsService],
})
export class OperationPropsModule {}
