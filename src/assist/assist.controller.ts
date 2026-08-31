import { Body, Controller, Post } from '@nestjs/common';
import { AssistService } from './assist.service';
import { ChatMessageDto } from './dto/chat.dto';

@Controller('assist')
export class AssistController {
  constructor(private readonly assistService: AssistService) {}

  // POST /assist/chat
  @Post('chat')
  chat(@Body() dto: ChatMessageDto) {
    return this.assistService.handleChat(dto);
  }
}
