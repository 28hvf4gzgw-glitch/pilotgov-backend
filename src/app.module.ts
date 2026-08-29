import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProcureModule } from './procure/procure.module';
import { IdentifyModule } from './identify/identify.module';
import { PilotModule } from './pilot/pilot.module';

@Module({
  imports: [ProcureModule, IdentifyModule, PilotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }