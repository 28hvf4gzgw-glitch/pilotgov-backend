import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePilotCardDto, CreatePilotRequestDto } from './dto/pilot.dto';

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

  // Deduplication strategy for requesting pilots:
  // 1. App-level check: findFirst by (startup, needId) or (startup, title, dept with active stage).
  // 2. DB-level backstop: Unique constraint @@unique([startup, needId]) catches concurrent race conditions (P2002).
  async requestPilot(dto: CreatePilotRequestDto) {
    if (
      !dto ||
      typeof dto.startup !== 'string' ||
      !dto.startup.trim() ||
      typeof dto.dept !== 'string' ||
      !dto.dept.trim() ||
      typeof dto.title !== 'string' ||
      !dto.title.trim() ||
      typeof dto.budget !== 'string' ||
      !dto.budget.trim()
    ) {
      throw new BadRequestException(
        'startup, dept, title, and budget are required and cannot be empty',
      );
    }

    const startup = dto.startup.trim();
    const dept = dto.dept.trim();
    const title = dto.title.trim();
    const budget = dto.budget.trim();
    const needId = dto.needId?.trim() || null;

    // 1. If needId is present, check existing by (startup, needId)
    if (needId) {
      const existing = await this.prisma.pilotCard.findFirst({
        where: { startup, needId },
      });
      if (existing) {
        return {
          duplicate: true,
          card: existing,
          board: await this.findAll(),
        };
      }
    } else {
      // If needId is absent, check by (startup, title, dept) with active status
      const existing = await this.prisma.pilotCard.findFirst({
        where: {
          startup,
          title,
          dept,
          status: { in: ['Applied', 'Piloting', 'Scaling'] },
        },
      });
      if (existing) {
        return {
          duplicate: true,
          card: existing,
          board: await this.findAll(),
        };
      }
    }

    const monthYear = new Date().toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    try {
      const card = await this.prisma.pilotCard.create({
        data: {
          startup,
          dept,
          title,
          budget,
          needId,
          status: 'Applied',
          accent: 'text-sky-400',
          progress: 0,
          date: `Applied ${monthYear}`,
        },
      });

      return {
        duplicate: false,
        card,
        board: await this.findAll(),
      };
    } catch (err: any) {
      // P2002: unique constraint error handling as hard race-condition backstop
      if (
        err?.code === 'P2002' ||
        (err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002')
      ) {
        const existingCard = await this.prisma.pilotCard.findFirst({
          where: needId
            ? { startup, needId }
            : { startup, title, dept },
        });
        return {
          duplicate: true,
          card: existingCard,
          board: await this.findAll(),
        };
      }
      throw err;
    }
  }

  // Creates a new pilot card with status 'Applied', accent 'text-sky-400',
  // progress 0, and date formatted like 'Applied Mar 2026'.
  // Returns this.findAll() to return the updated board state.
  async create(dto: CreatePilotCardDto) {
    if (
      !dto ||
      typeof dto.startup !== 'string' ||
      !dto.startup.trim() ||
      typeof dto.dept !== 'string' ||
      !dto.dept.trim() ||
      typeof dto.title !== 'string' ||
      !dto.title.trim() ||
      typeof dto.budget !== 'string' ||
      !dto.budget.trim()
    ) {
      throw new BadRequestException(
        'startup, dept, title, and budget are required and cannot be empty',
      );
    }

    const monthYear = new Date().toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    await this.prisma.pilotCard.create({
      data: {
        startup: dto.startup.trim(),
        dept: dto.dept.trim(),
        title: dto.title.trim(),
        budget: dto.budget.trim(),
        status: 'Applied',
        accent: 'text-sky-400',
        progress: 0,
        date: `Applied ${monthYear}`,
      },
    });

    return this.findAll();
  }

  // Moves a card (matched by id) to the next stage. If the next stage is
  // "Completed", this ALSO creates a real ScaledContract record — a
  // pilot that finishes isn't just a card that moved, it's a scaled deal.
  async advance(cardId: string) {
    const card = await this.prisma.pilotCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundException(`Pilot card "${cardId}" not found`);
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
      const contract = await this.prisma.scaledContract.create({
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

      await this.prisma.pilotCard.update({
        where: { id: card.id },
        data: {
          scaledContractId: contract.id,
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
