import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProcureModule } from './procure/procure.module';
import { IdentifyModule } from './identify/identify.module';
import { PilotModule } from './pilot/pilot.module';
import { ScaleModule } from './scale/scale.module';
import { PrismaModule } from './prisma/prisma.module';

import { AssistModule } from './assist/assist.module';
import { ImpactModule } from './impact/impact.module';
import { ReportModule } from './report/report.module';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProcureModule,
    IdentifyModule,
    PilotModule,
    ScaleModule,
    AssistModule,
    ImpactModule,
    ReportModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

