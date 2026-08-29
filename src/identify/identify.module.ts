import { Module } from '@nestjs/common';
import { IdentifyController } from './identify.controller';
import { IdentifyService } from './identify.service';

@Module({
  controllers: [IdentifyController],
  providers: [IdentifyService],
  exports: [IdentifyService],
})
export class IdentifyModule {}
