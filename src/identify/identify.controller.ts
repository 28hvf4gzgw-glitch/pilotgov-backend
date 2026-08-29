import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { IdentifyService } from './identify.service';
import { CreateNeedDto } from './dto/need.dto';

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
  create(@Body() dto: CreateNeedDto) {
    return this.identifyService.create(dto);
  }
}
