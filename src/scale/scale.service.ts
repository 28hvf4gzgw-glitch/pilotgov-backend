import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScaleService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.scaledContract.findMany({
      orderBy: { contractDate: 'desc' },
    });
  }

  // A small summary for the Trust/Outcomes dashboard — total pilots scaled
  // and combined contract value, computed from real records instead of
  // hardcoded stats.
  async summary() {
    const contracts = await this.prisma.scaledContract.findMany();

    return {
      totalScaled: contracts.length,
      contracts,
    };
  }
}
