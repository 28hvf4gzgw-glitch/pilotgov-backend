import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { CreatePilotRequestDto } from './dto/pilot.dto';
import type { CreatePilotCardDto } from './dto/pilot.dto';
import { PilotService } from './pilot.service';

@Controller('pilot')
export class PilotController {
  constructor(private readonly pilotService: PilotService) {}

  // GET /pilot/pipeline
  @Get('pipeline')
  findAll() {
    return this.pilotService.findAll();
  }

  // POST /pilot/cards
  @Post('cards')
  create(@Body() dto: CreatePilotCardDto) {
    return this.pilotService.create(dto);
  }

  // POST /pilot/request
  @Post('request')
  requestPilot(@Body() dto: CreatePilotRequestDto) {
    return this.pilotService.requestPilot(dto);
  }

  // PATCH /pilot/advance  { "cardId": "..." }
  @Patch('advance')
  advance(@Body('cardId') cardId: string) {
    return this.pilotService.advance(cardId);
  }
}


