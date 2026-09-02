import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateNeedDto } from './dto/need.dto';
import { IdentifyService } from './identify.service';

@Controller('identify')
export class IdentifyController {
  constructor(private readonly identifyService: IdentifyService) {}

  // GET /identify/needs
  @Get('needs')
  findAll() {
    return this.identifyService.findAll();
  }

  // GET /identify/needs/:id
  @Get('needs/:id')
  findOne(@Param('id') id: string) {
    const need = this.identifyService.findOne(id);
    if (!need) {
      throw new NotFoundException(`Need "${id}" not found`);
    }
    return need;
  }

  // POST /identify/needs
  @Post('needs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICER)
  create(@Body() dto: CreateNeedDto) {
    return this.identifyService.create(dto);
  }
}
