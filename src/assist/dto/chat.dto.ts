export class ChatMessageDto {
  message: string;
}

export interface ChatResponseDto {
  reply: string;
  suggestions: string[];
}
