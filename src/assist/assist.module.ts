import { Module } from '@nestjs/common';
import { AssistController } from './assist.controller';
import { AssistService } from './assist.service';

@Module({
  controllers: [AssistController],
  providers: [AssistService],
  exports: [AssistService],
})
export class AssistModule {}
