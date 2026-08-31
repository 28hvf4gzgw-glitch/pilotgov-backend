import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Parses budget string representations like "₹50L", "₹1.2Cr", "₹48L"
 * into a raw number of rupees.
 * Supports Lakh ('L', 'Lakh') -> multiplier 100,000
 * and Crore ('Cr', 'Crore') -> multiplier 10,000,000.
 */
export function parseBudgetStringToRupees(budgetStr?: string | null): number {
  if (!budgetStr || typeof budgetStr !== 'string') return 0;

  const match = budgetStr.match(/₹?\s*([\d.]+)\s*(cr|crore|l|lakh)?/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  if (isNaN(value)) return 0;

  const unit = match[2]?.toUpperCase();
  if (unit === 'CR' || unit === 'CRORE') {
    return Math.round(value * 10_000_000);
  }
  if (unit === 'L' || unit === 'LAKH') {
    return Math.round(value * 100_000);
  }

  return Math.round(value);
}

/**
 * Formats a raw rupee value into a readable display string like "₹1.2Cr" or "₹50L".
 */
export function formatRupeesToDisplay(rawRupees: number): string {
  if (!rawRupees || isNaN(rawRupees) || rawRupees <= 0) {
    return '₹0';
  }

  if (rawRupees >= 10_000_000) {
    const cr = rawRupees / 10_000_000;
    const formatted =
      cr % 1 === 0 ? cr.toString() : parseFloat(cr.toFixed(2)).toString();
    return `₹${formatted}Cr`;
  }

  if (rawRupees >= 100_000) {
    const lakh = rawRupees / 100_000;
    const formatted =
      lakh % 1 === 0 ? lakh.toString() : parseFloat(lakh.toFixed(2)).toString();
    return `₹${formatted}L`;
  }

  return `₹${rawRupees}`;
}

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
