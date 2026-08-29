export type Eligibility = 'DPIIT Verified' | 'Provisional' | 'Pending';

export interface PastPilotDto {
  dept: string;
  title: string;
  outcome: string;
}

export interface StartupDto {
  id: string; // added for real records — frontend can ignore if unused
  name: string;
  domain: string;
  tags: string[];
  eligibility: Eligibility;
  match: number;
  pilots: number;
  pitch: string;
  mission: string;
  trl: number;
  pastPilots: PastPilotDto[];
}

// Query params the frontend already supports in its UI (search + domain filter)
export class StartupQueryDto {
  query?: string;
  domain?: string;
  needId?: string; // when matching against a specific posted "need" from IdentifyModule
}
