import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  AdvancePilotDto,
  CreatePilotCardDto,
  CreatePilotRequestDto,
} from './dto/pilot.dto';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STARTUP)
  requestPilot(@Body() dto: CreatePilotRequestDto) {
    return this.pilotService.requestPilot(dto);
  }

  // PATCH /pilot/advance  { "cardId": "..." }
  @Patch('advance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICER)
  advance(@Body() dto: AdvancePilotDto) {
    return this.pilotService.advance(dto.cardId);
  }
}


