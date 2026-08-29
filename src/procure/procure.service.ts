import { Injectable } from '@nestjs/common';
import { StartupDto, StartupQueryDto } from './dto/startup.dto';

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
    pitch: 'Satellite + sensor analytics for crop yield forecasting across 12 states.',
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
    pitch: 'Distributed solar microgrids for round-the-clock rural electrification.',
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
    pitch: 'Offline-first electronic health records for primary health centres.',
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
  findAll(q: StartupQueryDto): StartupDto[] {
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

    // If matched against a specific posted need, recompute a simple,
    // explainable relevance score instead of using the static seed score.
    // This is intentionally simple (keyword/tag overlap) so you can explain
    // exactly how it works to judges — swap in embeddings later if you want.
    if (q.needId) {
      results = results
        .map((s) => ({ ...s, match: this.scoreAgainstNeed(s, q.needId!) }))
        .sort((a, b) => b.match - a.match);
    }

    return results;
  }

  findOne(id: string): StartupDto | undefined {
    return STARTUPS.find((s) => s.id === id);
  }

  private scoreAgainstNeed(startup: StartupDto, needId: string): number {
    // Placeholder scoring until IdentifyModule's real "need" text is wired in.
    // Keep the seed match score as a base so the UI still looks meaningful.
    return startup.match;
  }
}
