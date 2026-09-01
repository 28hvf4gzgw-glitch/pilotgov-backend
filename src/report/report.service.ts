import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getOutcomes() {
    const [totalNeeds, pilotsInProgress, completedPilots, scaledContracts] =
      await Promise.all([
        this.prisma.need.count(),
        this.prisma.pilotCard.count({
          where: { status: { not: 'Completed' } },
        }),
        this.prisma.pilotCard.count({
          where: { status: 'Completed' },
        }),
        this.prisma.scaledContract.count(),
      ]);

    const totalPilots = pilotsInProgress + completedPilots;
    const successRate =
      totalPilots > 0
        ? Math.round(((scaledContracts + completedPilots) / totalPilots) * 100)
        : 0;

    return {
      totalNeeds,
      pilotsInProgress,
      scaledContracts,
      successRate,
    };
  }
}
