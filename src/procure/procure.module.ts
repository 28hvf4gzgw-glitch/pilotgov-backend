import { Module } from '@nestjs/common';
import { ProcureController } from './procure.controller';
import { ProcureService } from './procure.service';

@Module({
  controllers: [ProcureController],
  providers: [ProcureService],
  exports: [ProcureService],
})
export class ProcureModule {}
