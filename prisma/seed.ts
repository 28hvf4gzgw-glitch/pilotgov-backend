// Run with: npx ts-node prisma/seed.ts
// (or add "prisma": { "seed": "ts-node prisma/seed.ts" } to package.json
// and run `npx prisma db seed`)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding needs...');
  await prisma.need.create({
    data: {
      dept: 'Dept. of Rural Development',
      title: 'Vernacular e-learning for 240 village schools',
      description:
        'Need an offline-capable, mother-tongue learning platform deployable across low-connectivity village schools.',
      budget: '₹48L',
      domain: 'EdTech',
      status: 'Matching',
    },
  });

  console.log('Seeding pilot cards...');
  await prisma.pilotCard.createMany({
    data: [
      {
        startup: 'EduBridge',
        dept: 'Dept. of Rural Development',
        title: 'Vernacular e-learning for 240 village schools',
        budget: '₹48L',
        progress: 10,
        date: 'Applied Mar 2026',
        status: 'Applied',
        accent: 'text-sky-400',
      },
      {
        startup: 'AgroSense AI',
        dept: 'Dept. of Rural Development',
        title: 'Crop yield forecasting across 8 districts',
        budget: '₹1.2Cr',
        progress: 60,
        date: 'Pilot started Jan 2026',
        status: 'Piloting',
        accent: 'text-amber-400',
      },
      {
        startup: 'MedTrack Solutions',
        dept: 'Dept. of Health & Family Welfare',
        title: 'Offline EHR rollout in 50 primary health centres',
        budget: '₹85L',
        progress: 45,
        date: 'Pilot started Feb 2026',
        status: 'Piloting',
        accent: 'text-amber-400',
      },
      {
        startup: 'CleanGrid Energy',
        dept: 'Dept. of Urban Infrastructure',
        title: 'Solar microgrids for 15 municipal zones',
        budget: '₹4.5Cr',
        progress: 100,
        date: 'Pilot started Jan 2026 · Scaled Jun 2026',
        status: 'Scaling',
        accent: 'text-emerald-400',
      },
      {
        startup: 'UrbanFlow Logistics',
        dept: 'Dept. of Urban Infrastructure',
        title: 'AI traffic routing pilot — 3 corridor cities',
        budget: '₹62L',
        progress: 100,
        date: 'Completed Apr 2026',
        status: 'Completed',
        accent: 'text-white/60',
      },
    ],
  });

  console.log('Seeding scaled contract (matching the already-Completed card above)...');
  await prisma.scaledContract.create({
    data: {
      startup: 'UrbanFlow Logistics',
      dept: 'Dept. of Urban Infrastructure',
      title: 'AI traffic routing pilot — 3 corridor cities',
      pilotBudget: '₹62L',
      scaledBudget: '₹2.5Cr',
      pilotStartDate: 'Completed Apr 2026',
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
