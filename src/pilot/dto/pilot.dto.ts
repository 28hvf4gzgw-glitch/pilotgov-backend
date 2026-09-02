import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type PilotStatus = 'Applied' | 'Piloting' | 'Scaling' | 'Completed';

export interface PilotCardDto {
  id?: string;
  startup: string;
  dept: string;
  title: string;
  budget: string;
  progress: number;
  date: string;
  needId?: string;
  scaledContractId?: string;
}

export class CreatePilotCardDto {
  @IsString()
  @IsNotEmpty()
  startup: string;

  @IsString()
  @IsNotEmpty()
  dept: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  budget: string;
}

export class CreatePilotRequestDto {
  @IsString()
  @IsNotEmpty()
  startup: string;

  @IsString()
  @IsNotEmpty()
  dept: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  budget: string;

  @IsOptional()
  @IsString()
  needId?: string;
}

export class AdvancePilotDto {
  @IsString()
  @IsNotEmpty()
  cardId: string;
}

export interface PilotColumnDto {
  status: PilotStatus;
  accent: string;
  cards: PilotCardDto[];
}

