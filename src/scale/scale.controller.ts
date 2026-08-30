import { Controller, Get } from '@nestjs/common';
import { ScaleService } from './scale.service';

@Controller('scale')
export class ScaleController {
  constructor(private readonly scaleService: ScaleService) {}

  // GET /scale/contracts — every real scaled procurement contract,
  // created automatically when a pilot reaches "Completed"
  @Get('contracts')
  findAll() {
    return this.scaleService.findAll();
  }

  // GET /scale/summary — count + list, handy for a dashboard widget
  @Get('summary')
  summary() {
    return this.scaleService.summary();
  }
}
