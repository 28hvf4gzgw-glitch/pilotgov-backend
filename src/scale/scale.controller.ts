import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
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

  // GET /scale/contracts/:id/pdf — PDF download for a scaled procurement contract
  @Get('contracts/:id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.scaleService.generateContractPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contract-${id}.pdf"`,
    });
    res.send(pdf);
  }

  // GET /scale/summary — count + list, handy for a dashboard widget
  @Get('summary')
  summary() {
    return this.scaleService.summary();
  }
}
