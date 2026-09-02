import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNeedDto {
  @IsString()
  @IsNotEmpty()
  dept: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  budget: string; // e.g. "₹50L" — kept as a display string, same convention as PilotCard.budget

  @IsString()
  @IsNotEmpty()
  domain: string; // matches the Startup.domain values (AgriTech, CleanTech, etc.) so matching is trivial later
}

export interface NeedDto extends CreateNeedDto {
  id: string;
  postedAt: string; // ISO date string
  status: 'Open' | 'Matching' | 'Closed';
}
