import { Injectable } from '@nestjs/common';
import { PilotColumnDto, PilotStatus } from './dto/pilot.dto';

const STAGE_ORDER: PilotStatus[] = ['Applied', 'Piloting', 'Scaling', 'Completed'];

@Injectable()
export class PilotService {
  // Mirrors src/lib/data.ts pilotColumns exactly — swap for a real query later.
  private columns: PilotColumnDto[] = [
    {
      status: 'Applied',
      accent: 'text-sky-400',
      cards: [
        {
          startup: 'EduBridge',
          dept: 'Dept. of Rural Development',
          title: 'Vernacular e-learning for 240 village schools',
          budget: '₹48L',
          progress: 10,
          date: 'Applied Mar 2026',
        },
      ],
    },
    {
      status: 'Piloting',
      accent: 'text-amber-400',
      cards: [
        {
          startup: 'AgroSense AI',
          dept: 'Dept. of Rural Development',
          title: 'Crop yield forecasting across 8 districts',
          budget: '₹1.2Cr',
          progress: 60,
          date: 'Pilot started Jan 2026',
        },
        {
          startup: 'MedTrack Solutions',
          dept: 'Dept. of Health & Family Welfare',
          title: 'Offline EHR rollout in 50 primary health centres',
          budget: '₹85L',
          progress: 45,
          date: 'Pilot started Feb 2026',
        },
      ],
    },
    {
      status: 'Scaling',
      accent: 'text-emerald-400',
      cards: [
        {
          startup: 'CleanGrid Energy',
          dept: 'Dept. of Urban Infrastructure',
          title: 'Solar microgrids for 15 municipal zones',
          budget: '₹4.5Cr',
          progress: 100,
          date: 'Pilot started Jan 2026 · Scaled Jun 2026',
        },
      ],
    },
    {
      status: 'Completed',
      accent: 'text-white/60',
      cards: [
        {
          startup: 'UrbanFlow Logistics',
          dept: 'Dept. of Urban Infrastructure',
          title: 'AI traffic routing pilot — 3 corridor cities',
          budget: '₹62L',
          progress: 100,
          date: 'Completed Apr 2026',
        },
      ],
    },
  ];

  findAll(): PilotColumnDto[] {
    return this.columns;
  }

  // Moves a card (matched by title) to the next stage — handy for a live
  // demo ("watch it graduate from Piloting to Scaling") without a full
  // pilot-tracking data model. Swap for real state transitions later.
  advance(cardTitle: string): PilotColumnDto[] {
    for (let i = 0; i < this.columns.length - 1; i++) {
      const col = this.columns[i];
      const idx = col.cards.findIndex((c) => c.title === cardTitle);
      if (idx !== -1) {
        const [card] = col.cards.splice(idx, 1);
        const nextStatus = STAGE_ORDER[i + 1];
        const nextCol = this.columns.find((c) => c.status === nextStatus)!;
        nextCol.cards.unshift({ ...card, progress: 100 });
        break;
      }
    }
    return this.columns;
  }
}
