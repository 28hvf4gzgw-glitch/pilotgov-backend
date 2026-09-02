import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewService } from './review.service';

describe('ReviewService', () => {
  let service: ReviewService;

  const mockPrismaService = {
    scaledContract: {
      findUnique: jest.fn(),
    },
    review: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validDto = {
      scaledContractId: '123e4567-e89b-12d3-a456-426614174000',
      rating: 5,
      comment: 'Outstanding pilot outcome and smooth scaling transition.',
    };

    it('should create and return a review for a citizen', async () => {
      mockPrismaService.scaledContract.findUnique.mockResolvedValue({
        id: validDto.scaledContractId,
        title: 'Solar Grid Pilot',
      });
      mockPrismaService.review.findFirst.mockResolvedValue(null);
      mockPrismaService.review.create.mockResolvedValue({
        id: 'review-uuid-1',
        ...validDto,
        citizenId: 'citizen-uuid-1',
        createdAt: new Date(),
        citizen: { name: 'Aarav Patel' },
      });

      const result = await service.create('citizen-uuid-1', validDto);

      expect(result).toHaveProperty('id', 'review-uuid-1');
      expect(result.citizen.name).toBe('Aarav Patel');
      expect(mockPrismaService.review.create).toHaveBeenCalledWith({
        data: {
          scaledContractId: validDto.scaledContractId,
          citizenId: 'citizen-uuid-1',
          rating: 5,
          comment: validDto.comment,
        },
        include: {
          citizen: {
            select: { name: true },
          },
        },
      });
    });

    it('should throw NotFoundException if scaledContract does not exist', async () => {
      mockPrismaService.scaledContract.findUnique.mockResolvedValue(null);

      await expect(service.create('citizen-uuid-1', validDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if citizen has already reviewed the contract', async () => {
      mockPrismaService.scaledContract.findUnique.mockResolvedValue({
        id: validDto.scaledContractId,
      });
      mockPrismaService.review.findFirst.mockResolvedValue({
        id: 'existing-review-id',
      });

      await expect(service.create('citizen-uuid-1', validDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByContract', () => {
    it('should return reviews for a contract ordered by newest first', async () => {
      const mockReviews = [
        {
          id: 'r1',
          scaledContractId: 'contract-1',
          rating: 5,
          comment: 'Great work',
          citizen: { name: 'Priya' },
          createdAt: new Date(),
        },
      ];
      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findByContract('contract-1');
      expect(result).toEqual(mockReviews);
      expect(mockPrismaService.review.findMany).toHaveBeenCalledWith({
        where: { scaledContractId: 'contract-1' },
        orderBy: { createdAt: 'desc' },
        include: {
          citizen: {
            select: { name: true },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all reviews joined with contract and citizen', async () => {
      const mockReviews = [
        {
          id: 'r1',
          rating: 4,
          comment: 'Solid execution',
          citizen: { name: 'Aarav' },
          scaledContract: {
            id: 'c1',
            title: 'EV Fleet',
            dept: 'Transport',
            startup: 'VoltMove',
          },
        },
      ];
      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findAll();
      expect(result).toEqual(mockReviews);
    });
  });

  describe('getContractStats', () => {
    it('should compute average rating and count correctly', async () => {
      mockPrismaService.review.findMany.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
      ]);

      const result = await service.getContractStats('c1');
      expect(result).toEqual({
        scaledContractId: 'c1',
        avgRating: 4.5,
        reviewCount: 2,
      });
    });

    it('should return avgRating 0 when there are no reviews', async () => {
      mockPrismaService.review.findMany.mockResolvedValue([]);

      const result = await service.getContractStats('c1');
      expect(result).toEqual({
        scaledContractId: 'c1',
        avgRating: 0,
        reviewCount: 0,
      });
    });
  });
});
