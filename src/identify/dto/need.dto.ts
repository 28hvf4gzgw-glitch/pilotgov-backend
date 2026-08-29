export class CreateNeedDto {
  dept: string;
  title: string;
  description: string;
  budget: string; // e.g. "₹50L" — kept as a display string, same convention as PilotCard.budget
  domain: string; // matches the Startup.domain values (AgriTech, CleanTech, etc.) so matching is trivial later
}

export interface NeedDto extends CreateNeedDto {
  id: string;
  postedAt: string; // ISO date string
  status: 'Open' | 'Matching' | 'Closed';
}
