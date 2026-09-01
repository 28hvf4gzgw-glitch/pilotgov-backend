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

export interface CreatePilotCardDto {
  startup: string;
  dept: string;
  title: string;
  budget: string;
}

export class CreatePilotRequestDto {
  startup: string;
  dept: string;
  title: string;
  budget: string;
  needId?: string;
}

export interface PilotColumnDto {
  status: PilotStatus;
  accent: string;
  cards: PilotCardDto[];
}

