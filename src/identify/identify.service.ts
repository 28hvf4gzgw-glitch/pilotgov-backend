import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateNeedDto, NeedDto } from './dto/need.dto';

@Injectable()
export class IdentifyService {
  // In-memory store — swap for Prisma/TypeORM once the DB is ready.
  // Controller and frontend don't need to change when you do.
  private needs: NeedDto[] = [
    {
      id: 'seed-1',
      dept: 'Dept. of Rural Development',
      title: 'Vernacular e-learning for 240 village schools',
      description:
        'Need an offline-capable, mother-tongue learning platform deployable across low-connectivity village schools.',
      budget: '₹48L',
      domain: 'EdTech',
      postedAt: '2026-03-02T00:00:00.000Z',
      status: 'Matching',
    },
  ];

  findAll(): NeedDto[] {
    return this.needs;
  }

  findOne(id: string): NeedDto | undefined {
    return this.needs.find((n) => n.id === id);
  }

  create(dto: CreateNeedDto): NeedDto {
    const need: NeedDto = {
      ...dto,
      id: randomUUID(),
      postedAt: new Date().toISOString(),
      status: 'Open',
    };
    this.needs.unshift(need); // newest first
    return need;
  }
}
