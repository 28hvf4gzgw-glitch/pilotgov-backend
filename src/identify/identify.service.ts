import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNeedDto } from './dto/need.dto';

@Injectable()
export class IdentifyService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.need.findMany({
      orderBy: { postedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.need.findUnique({ where: { id } });
  }

  create(dto: CreateNeedDto) {
    return this.prisma.need.create({
      data: {
        dept: dto.dept,
        title: dto.title,
        description: dto.description,
        budget: dto.budget,
        domain: dto.domain,
        status: 'Open',
      },
    });
  }
}
