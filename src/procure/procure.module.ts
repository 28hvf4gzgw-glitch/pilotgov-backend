import { Module } from '@nestjs/common';
import { ProcureController } from './procure.controller';
import { ProcureService } from './procure.service';

import { IdentifyModule } from '../identify/identify.module';

@Module({
  imports: [IdentifyModule],
  controllers: [ProcureController],
  providers: [ProcureService],
  exports: [ProcureService],
})
export class ProcureModule {}
