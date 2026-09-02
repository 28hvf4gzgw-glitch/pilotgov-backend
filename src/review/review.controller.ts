import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // GET /reviews — Public feed across all contracts
  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  // GET /reviews/contract/:id — Public reviews for a single contract
  @Get('contract/:id')
  findByContract(@Param('id') id: string) {
    return this.reviewService.findByContract(id);
  }

  // GET /reviews/contract/:id/stats — Public rating stats for a contract
  @Get('contract/:id/stats')
  getContractStats(@Param('id') id: string) {
    return this.reviewService.getContractStats(id);
  }

  // POST /reviews — Authenticated CITIZEN review submission
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CITIZEN)
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    const citizenId = req.user.userId;
    return this.reviewService.create(citizenId, dto);
  }
}
