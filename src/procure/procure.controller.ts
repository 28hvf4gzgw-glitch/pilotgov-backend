import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ProcureService } from './procure.service';
import { RequestPilotDto, StartupQueryDto } from './dto/startup.dto';

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

  // POST /procure/startups/:id/request-pilot
  @Post('startups/:id/request-pilot')
  requestPilot(
    @Param('id') id: string,
    @Body() dto: RequestPilotDto,
  ) {
    return this.procureService.requestPilot(id, dto);
  }
}

