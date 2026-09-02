import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

export interface ChatResponseDto {
  reply: string;
  suggestions: string[];
}
