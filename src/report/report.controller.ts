import { Controller, Get } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // GET /report/outcomes -> returns aggregated live metrics for the Full Report page
  @Get('outcomes')
  getOutcomes() {
    return this.reportService.getOutcomes();
  }
}
