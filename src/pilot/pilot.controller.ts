import { Body, Controller, Get, Patch } from '@nestjs/common';
import { PilotService } from './pilot.service';

@Controller('pilot')
export class PilotController {
  constructor(private readonly pilotService: PilotService) {}

  // GET /pilot/pipeline
  @Get('pipeline')
  findAll() {
    return this.pilotService.findAll();
  }

  // PATCH /pilot/advance  { "cardTitle": "..." }
  // Moves a card to the next stage — useful for a live demo.
  @Patch('advance')
  advance(@Body('cardTitle') cardTitle: string) {
    return this.pilotService.advance(cardTitle);
  }
}
