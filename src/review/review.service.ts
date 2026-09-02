import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submits a citizen review for a scaled contract.
   * Enforces 1 review per citizen per contract (app-level check + DB constraint backstop).
   */
  async create(citizenId: string, dto: CreateReviewDto) {
    // 1. Ensure target scaled contract exists
    const contract = await this.prisma.scaledContract.findUnique({
      where: { id: dto.scaledContractId },
    });

    if (!contract) {
      throw new NotFoundException(
        `Scaled contract "${dto.scaledContractId}" not found`,
      );
    }

    // 2. App-level deduplication check
    const existing = await this.prisma.review.findFirst({
      where: {
        scaledContractId: dto.scaledContractId,
        citizenId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'You have already submitted a review for this contract',
      );
    }

    // 3. Database insert with P2002 race-condition protection
    try {
      return await this.prisma.review.create({
        data: {
          scaledContractId: dto.scaledContractId,
          citizenId,
          rating: dto.rating,
          comment: dto.comment.trim(),
        },
        include: {
          citizen: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (err: any) {
      if (
        err?.code === 'P2002' ||
        (err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002')
      ) {
        throw new ConflictException(
          'You have already submitted a review for this contract',
        );
      }
      throw err;
    }
  }

  /**
   * Returns all reviews for a specific scaled contract, newest first.
   * Selects only citizen name for privacy.
   */
  async findByContract(scaledContractId: string) {
    return this.prisma.review.findMany({
      where: { scaledContractId },
      orderBy: { createdAt: 'desc' },
      include: {
        citizen: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  /**
   * Returns all reviews across all contracts, newest first.
   * Powers the public "All Reviews" feed.
   */
  async findAll() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        citizen: {
          select: {
            name: true,
          },
        },
        scaledContract: {
          select: {
            id: true,
            title: true,
            dept: true,
            startup: true,
          },
        },
      },
    });
  }

  /**
   * Returns rating statistics ({ avgRating, reviewCount }) for a contract.
   */
  async getContractStats(scaledContractId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { scaledContractId },
      select: { rating: true },
    });

    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10,
          ) / 10
        : 0;

    return {
      scaledContractId,
      avgRating,
      reviewCount,
    };
  }
}
