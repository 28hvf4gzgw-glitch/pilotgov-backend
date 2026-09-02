import { IsInt, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID('4', { message: 'scaledContractId must be a valid UUID' })
  scaledContractId: string;

  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;

  @IsString({ message: 'Comment must be a string' })
  @MinLength(5, { message: 'Comment must be at least 5 characters long' })
  @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
  comment: string;
}
