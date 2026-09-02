import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked.jwt.token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user and return token and user without passwordHash', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'uuid-1',
        email: 'officer@gov.in',
        name: 'Officer A',
        role: Role.OFFICER,
        orgName: 'Transport',
        createdAt: new Date(),
      });

      const result = await service.register({
        email: 'officer@gov.in',
        password: 'Password123!',
        name: 'Officer A',
        role: Role.OFFICER,
        orgName: 'Transport',
      });

      expect(result).toHaveProperty('accessToken', 'mocked.jwt.token');
      expect(result.user.email).toBe('officer@gov.in');
      expect(result.user.role).toBe(Role.OFFICER);
      expect((result.user as any).passwordHash).toBeUndefined();
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if user email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({
          email: 'officer@gov.in',
          password: 'Password123!',
          name: 'Officer A',
          role: Role.OFFICER,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should successfully authenticate user with correct credentials', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'officer@gov.in',
        passwordHash,
        name: 'Officer A',
        role: Role.OFFICER,
        orgName: 'Transport',
        createdAt: new Date(),
      });

      const result = await service.login({
        email: 'officer@gov.in',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('accessToken', 'mocked.jwt.token');
      expect(result.user.email).toBe('officer@gov.in');
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'officer@gov.in',
        passwordHash,
        name: 'Officer A',
        role: Role.OFFICER,
      });

      await expect(
        service.login({
          email: 'officer@gov.in',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@gov.in',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
