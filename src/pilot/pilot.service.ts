import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STAGE_ORDER = ['Applied', 'Piloting', 'Scaling', 'Completed'];
const STAGE_ACCENT: Record<string, string> = {
  Applied: 'text-sky-400',
  Piloting: 'text-amber-400',
  Scaling: 'text-emerald-400',
  Completed: 'text-white/60',
};

@Injectable()
export class PilotService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns cards grouped into the 4-column board shape the frontend expects.
  async findAll() {
    const cards = await this.prisma.pilotCard.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return STAGE_ORDER.map((status) => ({
      status,
      accent: STAGE_ACCENT[status],
      cards: cards.filter((c) => c.status === status),
    }));
  }

  // Moves a card (matched by title) to the next stage. If the next stage is
  // "Completed", this ALSO creates a real ScaledContract record — a
  // pilot that finishes isn't just a card that moved, it's a scaled deal.
  async advance(cardTitle: string) {
    const card = await this.prisma.pilotCard.findFirst({
      where: { title: cardTitle },
    });

    if (!card) {
      throw new NotFoundException(`Pilot card "${cardTitle}" not found`);
    }

    const currentIndex = STAGE_ORDER.indexOf(card.status);
    if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) {
      // Already completed, or unknown status — nothing to advance.
      return this.findAll();
    }

    const nextStatus = STAGE_ORDER[currentIndex + 1];

    await this.prisma.pilotCard.update({
      where: { id: card.id },
      data: {
        status: nextStatus,
        accent: STAGE_ACCENT[nextStatus],
        progress: nextStatus === 'Completed' ? 100 : card.progress,
      },
    });

    if (nextStatus === 'Completed') {
      await this.prisma.scaledContract.create({
        data: {
          startup: card.startup,
          dept: card.dept,
          title: card.title,
          pilotBudget: card.budget,
          // A simple, explainable scale-up multiplier for the demo —
          // swap for a real negotiated figure once that workflow exists.
          scaledBudget: this.estimateScaledBudget(card.budget),
          pilotStartDate: card.date,
        },
      });
    }

    return this.findAll();
  }

  // Very simple, explainable estimate: parse the leading number out of a
  // budget string like "₹48L" or "₹1.2Cr" and scale it up 4x as a stand-in
  // for "pilot succeeded, now procured at full department scale."
  private estimateScaledBudget(pilotBudget: string): string {
    const match = pilotBudget.match(/₹?([\d.]+)(L|Cr)?/i);
    if (!match) return pilotBudget;

    const value = parseFloat(match[1]);
    const unit = (match[2] || 'L').toUpperCase();
    const scaled = value * 4;

    return `₹${scaled % 1 === 0 ? scaled : scaled.toFixed(1)}${unit}`;
  }
}
