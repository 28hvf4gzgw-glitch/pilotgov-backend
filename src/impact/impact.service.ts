import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import {
  formatBudget,
  formatRupeesToDisplay,
  parseBudgetStringToRupees,
} from '../common/utils/budget.util';

export { formatBudget, formatRupeesToDisplay, parseBudgetStringToRupees };

@Injectable()
export class ImpactService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      needsPosted,
      activePilots,
      contractsScaled,
      scaledContracts,
      byDomain,
      pilotingCount,
      scalingCount,
    ] = await Promise.all([
      this.prisma.need.count(),
      this.prisma.pilotCard.count({
        where: {
          status: { in: ['Applied', 'Piloting', 'Scaling'] },
        },
      }),
      this.prisma.scaledContract.count(),
      this.prisma.scaledContract.findMany({
        select: { scaledBudget: true },
      }),
      this.prisma.need.groupBy({
        by: ['domain'],
        _count: true,
      }),
      this.prisma.pilotCard.count({
        where: { status: 'Piloting' },
      }),
      this.prisma.pilotCard.count({
        where: { status: 'Scaling' },
      }),
    ]);

    const totalScaledValueRaw = scaledContracts.reduce(
      (sum, contract) => sum + parseBudgetStringToRupees(contract.scaledBudget),
      0,
    );

    const totalScaledValueDisplay = formatRupeesToDisplay(totalScaledValueRaw);

    const pipelineFunnel = [
      { stage: 'Posted', count: needsPosted },
      { stage: 'Piloting', count: pilotingCount },
      { stage: 'Scaling', count: scalingCount },
      { stage: 'Scaled', count: contractsScaled },
    ];

    return {
      needsPosted,
      activePilots,
      contractsScaled,
      totalScaledValueRaw,
      totalScaledValueDisplay,
      byDomain,
      pipelineFunnel,
    };
  }
}
