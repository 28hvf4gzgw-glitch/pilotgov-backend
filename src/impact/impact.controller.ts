import { Controller, Get } from '@nestjs/common';
import { ImpactService } from './impact.service';

@Controller('impact')
export class ImpactController {
  constructor(private readonly impactService: ImpactService) {}

  // GET /impact/summary -> aggregated metrics across needs, active pilots,
  // scaled contracts, budget valuation, domain distribution, and pipeline funnel.
  @Get('summary')
  getSummary() {
    return this.impactService.getSummary();
  }
}
