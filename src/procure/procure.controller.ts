import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ProcureService } from './procure.service';
import { StartupQueryDto } from './dto/startup.dto';

@Controller('procure')
export class ProcureController {
  constructor(private readonly procureService: ProcureService) {}

  // GET /procure/startups?query=solar&domain=CleanTech&needId=abc123
  @Get('startups')
  findAll(@Query() query: StartupQueryDto) {
    return this.procureService.findAll(query);
  }

  // GET /procure/startups/agrosense-ai
  @Get('startups/:id')
  findOne(@Param('id') id: string) {
    const startup = this.procureService.findOne(id);
    if (!startup) {
      throw new NotFoundException(`Startup "${id}" not found`);
    }
    return startup;
  }
}
