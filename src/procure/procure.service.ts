import { Injectable, NotFoundException } from '@nestjs/common';
import { formatBudget } from '../common/utils/budget.util';
import { IdentifyService } from '../identify/identify.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  RequestPilotDto,
  StartupDto,
  StartupQueryDto,
} from './dto/startup.dto';

// Same records as src/lib/data.ts on the frontend — this is your seed data.
// Swap this array for a Prisma/TypeORM query once the DB is ready; nothing
// downstream (controller, frontend) needs to change when you do.
const STARTUPS: StartupDto[] = [
  {
    id: 'agrosense-ai',
    name: 'AgroSense AI',
    domain: 'AgriTech',
    tags: ['IoT', 'AI'],
    eligibility: 'DPIIT Verified',
    match: 96,
    pilots: 3,
    pitch:
      'Satellite + sensor analytics for crop yield forecasting across 12 states.',
    mission:
      'Empower smallholder farmers with predictive agronomy so every district can plan against climate volatility.',
    trl: 8,
    pastPilots: [
      {
        dept: 'Dept. of Agriculture, Karnataka',
        title: 'Yield forecasting — 3 districts',
        outcome: 'Forecast accuracy 91% across kharif & rabi seasons',
      },
      {
        dept: 'Dept. of Rural Development',
        title: 'Crop loss assessment pilot',
        outcome: 'Reduced claim verification time by 40%',
      },
      {
        dept: 'NITI Aayog Innovation Cell',
        title: 'District-level climate risk model',
        outcome: 'Adopted for 8 district contingency plans',
      },
    ],
  },
  {
    id: 'cleangrid-energy',
    name: 'CleanGrid Energy',
    domain: 'CleanTech',
    tags: ['Grid', 'Solar'],
    eligibility: 'DPIIT Verified',
    match: 92,
    pilots: 2,
    pitch:
      'Distributed solar microgrids for round-the-clock rural electrification.',
    mission:
      'Replace diesel-dependent rural power with resilient, community-owned solar microgrids managed via a single dashboard.',
    trl: 7,
    pastPilots: [
      {
        dept: 'Dept. of Urban Infrastructure',
        title: 'Solar microgrids — 15 municipal zones',
        outcome: 'Scaled to full contract, 4.2MW deployed',
      },
      {
        dept: 'Ministry of New & Renewable Energy',
        title: 'Village microgrid resilience study',
        outcome: '99.4% uptime over 6-month pilot',
      },
    ],
  },
  {
    id: 'medtrack-solutions',
    name: 'MedTrack Solutions',
    domain: 'HealthTech',
    tags: ['EHR', 'Mobile'],
    eligibility: 'DPIIT Verified',
    match: 88,
    pilots: 4,
    pitch:
      'Offline-first electronic health records for primary health centres.',
    mission:
      'Ensure every primary health centre has a patient record that travels with the patient, online or off.',
    trl: 9,
    pastPilots: [
      {
        dept: 'Dept. of Health & Family Welfare',
        title: 'Offline EHR rollout — 50 PHCs',
        outcome: 'Patient record coverage up from 12% to 94%',
      },
      {
        dept: 'National Health Authority',
        title: 'ABHA integration pilot',
        outcome: 'Linked 1.8L records to Ayushman Bharat',
      },
      {
        dept: 'Dept. of Health, Tamil Nadu',
        title: 'Maternal tracking — 3 districts',
        outcome: 'Antenatal follow-up improved by 35%',
      },
      {
        dept: 'WHO India Field Office',
        title: 'Vaccine cold-chain logging',
        outcome: 'Zero spoilage events over 90-day pilot',
      },
    ],
  },
  {
    id: 'urbanflow-logistics',
    name: 'UrbanFlow Logistics',
    domain: 'Smart Mobility',
    tags: ['Routing', 'AI'],
    eligibility: 'DPIIT Verified',
    match: 84,
    pilots: 1,
    pitch: 'AI-driven traffic routing to cut urban commute times by 22%.',
    mission:
      'Give city planners a live, adaptive routing layer that re-optimises signal timing and bus routes against real demand.',
    trl: 6,
    pastPilots: [
      {
        dept: 'Dept. of Urban Infrastructure',
        title: 'AI traffic routing — 3 corridor cities',
        outcome: 'Average commute down 22% on pilot corridors',
      },
    ],
  },
  {
    id: 'edubridge',
    name: 'EduBridge',
    domain: 'EdTech',
    tags: ['Learning', 'Vernacular'],
    eligibility: 'DPIIT Verified',
    match: 78,
    pilots: 2,
    pitch: 'Vernacular digital classrooms bridging the rural education gap.',
    mission:
      'Bring grade-appropriate, mother-tongue digital lessons to villages where broadband is unreliable and device access is shared.',
    trl: 7,
    pastPilots: [
      {
        dept: 'Dept. of School Education, MP',
        title: 'Vernacular lessons — 60 schools',
        outcome: 'Lesson completion rate up from 28% to 71%',
      },
      {
        dept: 'Ministry of Education',
        title: 'DIKSHA content localisation',
        outcome: 'Content delivered in 6 regional languages',
      },
    ],
  },
];

@Injectable()
export class ProcureService {
  constructor(
    private readonly identifyService: IdentifyService,
    private readonly prisma: PrismaService,
  ) {}

  async requestPilot(id: string, dto?: RequestPilotDto) {
    const startup = this.findOne(id);
    if (!startup) {
      throw new NotFoundException(`Startup "${id}" not found`);
    }

    let dept = 'Unassigned Department';
    let budget = '₹0L';
    let title = `Pilot with ${startup.name}`;

    if (dto?.needId) {
      const need = await this.prisma.need.findUnique({
        where: { id: dto.needId },
      });
      if (!need) {
        throw new NotFoundException(`Need "${dto.needId}" not found`);
      }
      dept = need.dept;
      budget = need.budget;
      title = `${need.title} — ${startup.name}`;
    }

    // Prevent duplicates: if a PilotCard already exists with same startup + title
    const existingCard = await this.prisma.pilotCard.findFirst({
      where: {
        startup: startup.name,
        title,
      },
    });

    if (existingCard) {
      return {
        created: false,
        card: {
          ...existingCard,
          budget: formatBudget(existingCard.budget),
        },
      };
    }

    const monthYear = new Date().toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    const card = await this.prisma.pilotCard.create({
      data: {
        startup: startup.name,
        dept,
        title,
        budget,
        status: 'Applied',
        accent: 'text-sky-400',
        progress: 0,
        date: `Applied ${monthYear}`,
      },
    });

    return {
      created: true,
      card: {
        ...card,
        budget: formatBudget(card.budget),
      },
    };
  }

  async findAll(q: StartupQueryDto): Promise<StartupDto[]> {
    let results = STARTUPS;

    if (q.domain) {
      results = results.filter((s) => s.domain === q.domain);
    }

    if (q.query) {
      const needle = q.query.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(needle) ||
          s.domain.toLowerCase().includes(needle) ||
          s.pitch.toLowerCase().includes(needle) ||
          s.tags.some((t) => t.toLowerCase().includes(needle)),
      );
    }

    // If matched against a specific posted need, fetch the Need via Prisma
    // and recompute a transparent, explainable relevance score.
    if (q.needId) {
      const need = await this.prisma.need.findUnique({
        where: { id: q.needId },
      });

      if (need) {
        const scored = results.map((s) => {
          const { match, matchReason } = this.calculateMatch(s, need);
          return { ...s, match, matchReason };
        });
        results = scored.sort((a, b) => b.match - a.match);
      }
    }

    return results;
  }

  findOne(id: string): StartupDto | undefined {
    return STARTUPS.find((s) => s.id === id);
  }

  async scoreAgainstNeed(
    startup: StartupDto,
    needId: string,
  ): Promise<{ match: number; matchReason: string }> {
    const need = await this.prisma.need.findUnique({
      where: { id: needId },
    });

    if (!need) {
      return {
        match: startup.match,
        matchReason: 'Original static score (Need not found in DB)',
      };
    }

    return this.calculateMatch(startup, need);
  }

  private calculateMatch(
    startup: StartupDto,
    need: {
      domain: string;
      title: string;
      description: string;
      dept?: string;
    },
  ): { match: number; matchReason: string } {
    const reasons: string[] = [];
    let score = 0;

    // 1. Domain exact match: +40 points
    const isDomainMatch =
      startup.domain.toLowerCase() === need.domain.toLowerCase();
    if (isDomainMatch) {
      score += 40;
      reasons.push(`Domain match (${startup.domain}) +40%`);
    }

    // 2. Tag overlap in Need title or description: +15 per tag, capped at +30
    const needText = `${need.title} ${need.description}`.toLowerCase();
    const matchedTags = startup.tags.filter((tag) =>
      needText.includes(tag.toLowerCase()),
    );
    if (matchedTags.length > 0) {
      const tagScore = Math.min(30, matchedTags.length * 15);
      score += tagScore;
      reasons.push(
        `${matchedTags.length} tag${matchedTags.length > 1 ? 's' : ''} matched (${matchedTags.join(', ')}) +${tagScore}%`,
      );
    }

    // 3. Keyword overlap between Need (title + desc) and Startup (pitch + mission): up to +20 points
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'across', 'need', 'needs', 'platform', 'system',
      'solution', 'solutions', 'pilot', 'pilots', 'deploy', 'deployable',
      'into', 'from', 'this', 'that', 'have', 'been', 'will', 'over', 'under',
      'low', 'high', 'school', 'schools', 'village', 'villages', 'district', 'districts',
      'state', 'states', 'central', 'govt', 'government', 'department', 'dept',
    ]);

    const needWords = needText
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    const startupText = `${startup.pitch} ${startup.mission}`.toLowerCase();
    const matchedKeywords = Array.from(
      new Set(needWords.filter((w) => startupText.includes(w))),
    );

    if (matchedKeywords.length > 0) {
      const keywordScore = Math.min(20, matchedKeywords.length * 5);
      score += keywordScore;
      reasons.push(
        `Pitch & mission keyword overlap (${matchedKeywords.slice(0, 3).join(', ')}) +${keywordScore}%`,
      );
    }

    // 4. DPIIT Verification & Readiness baseline: +10 points
    if (startup.eligibility === 'DPIIT Verified' || startup.trl >= 7) {
      score += 10;
      reasons.push(
        `${startup.eligibility === 'DPIIT Verified' ? 'DPIIT Verified' : `TRL ${startup.trl}`} +10%`,
      );
    }

    const totalScore = Math.min(100, Math.max(0, score));
    const matchReason =
      reasons.length > 0
        ? reasons.join(', ')
        : 'No direct keyword or domain match found';

    return { match: totalScore, matchReason };
  }
}
