export type PilotStatus = 'Applied' | 'Piloting' | 'Scaling' | 'Completed';

export interface PilotCardDto {
  startup: string;
  dept: string;
  title: string;
  budget: string;
  progress: number;
  date: string;
}

export interface PilotColumnDto {
  status: PilotStatus;
  accent: string;
  cards: PilotCardDto[];
}
