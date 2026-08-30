import { Module } from '@nestjs/common';
import { ScaleController } from './scale.controller';
import { ScaleService } from './scale.service';

@Module({
  controllers: [ScaleController],
  providers: [ScaleService],
})
export class ScaleModule {}
