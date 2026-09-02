import { Injectable } from '@nestjs/common';
import { formatBudget } from '../common/utils/budget.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNeedDto } from './dto/need.dto';

@Injectable()
export class IdentifyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const needs = await this.prisma.need.findMany({
      orderBy: { postedAt: 'desc' },
    });
    return needs.map((n) => ({
      ...n,
      budget: formatBudget(n.budget),
    }));
  }

  async findOne(id: string) {
    const need = await this.prisma.need.findUnique({ where: { id } });
    if (!need) return null;
    return {
      ...need,
      budget: formatBudget(need.budget),
    };
  }

  async create(dto: CreateNeedDto) {
    const need = await this.prisma.need.create({
      data: {
        dept: dto.dept,
        title: dto.title,
        description: dto.description,
        budget: dto.budget,
        domain: dto.domain,
        status: 'Open',
      },
    });
    return {
      ...need,
      budget: formatBudget(need.budget),
    };
  }
}
