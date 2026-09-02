import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Reviews Module (e2e)', () => {
  jest.setTimeout(30000);

  let app: INestApplication<App>;
  let citizenToken: string;
  let officerToken: string;
  let startupToken: string;
  let contractId: string;

  const timestamp = Date.now();
  const citizenEmail = `rev_citizen_${timestamp}@citizen.org`;
  const officerEmail = `rev_officer_${timestamp}@dept.gov`;
  const startupEmail = `rev_startup_${timestamp}@innovate.co`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // 1. Register Citizen
    const citizenRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: citizenEmail,
        password: testPassword,
        name: 'Aarav Citizen',
        role: 'CITIZEN',
      });
    citizenToken = citizenRes.body.accessToken;

    // 2. Register Officer
    const officerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: officerEmail,
        password: testPassword,
        name: 'Officer Rao',
        role: 'OFFICER',
        orgName: 'Transport Dept',
      });
    officerToken = officerRes.body.accessToken;

    // 3. Register Startup
    const startupRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: startupEmail,
        password: testPassword,
        name: 'Startup CEO',
        role: 'STARTUP',
        orgName: 'VoltMove',
      });
    startupToken = startupRes.body.accessToken;

    // 4. Create a pilot request and advance it to Completed to get a real ScaledContract
    const pilotRes = await request(app.getHttpServer())
      .post('/pilot/request')
      .set('Authorization', `Bearer ${startupToken}`)
      .send({
        startup: `VoltMove_${timestamp}`,
        dept: 'Transport Dept',
        title: 'EV Fleet Optimization',
        budget: '₹50L',
      });

    const cardId = pilotRes.body.card.id;

    // Advance 3 times: Applied -> Piloting -> Scaling -> Completed
    await request(app.getHttpServer())
      .patch('/pilot/advance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ cardId });

    await request(app.getHttpServer())
      .patch('/pilot/advance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ cardId });

    await request(app.getHttpServer())
      .patch('/pilot/advance')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ cardId });

    // Fetch the generated contract
    const contractsRes = await request(app.getHttpServer())
      .get('/scale/contracts')
      .expect(200);

    const matchContract = contractsRes.body.find(
      (c: any) => c.title === 'EV Fleet Optimization',
    );
    contractId = matchContract.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /reviews (@Roles(CITIZEN))', () => {
    it('should allow authenticated CITIZEN to submit a review', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          scaledContractId: contractId,
          rating: 5,
          comment: 'Excellent deployment in our district. Highly impactful!',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.rating).toBe(5);
      expect(res.body.comment).toBe(
        'Excellent deployment in our district. Highly impactful!',
      );
      expect(res.body.citizen.name).toBe('Aarav Citizen');
      expect(res.body.citizen.email).toBeUndefined();
      expect(res.body.citizen.passwordHash).toBeUndefined();
    });

    it('should reject duplicate review by the same citizen on the same contract (409 Conflict)', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          scaledContractId: contractId,
          rating: 4,
          comment: 'Attempting a second review on the same contract.',
        })
        .expect(409);
    });

    it('should forbid OFFICER from submitting a review (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          scaledContractId: contractId,
          rating: 5,
          comment: 'Officers should not submit citizen reviews.',
        })
        .expect(403);
    });

    it('should forbid STARTUP from submitting a review (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${startupToken}`)
        .send({
          scaledContractId: contractId,
          rating: 5,
          comment: 'Startups should not submit citizen reviews.',
        })
        .expect(403);
    });

    it('should reject unauthenticated review submissions (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .send({
          scaledContractId: contractId,
          rating: 5,
          comment: 'Anonymous reviews are rejected.',
        })
        .expect(401);
    });

    it('should validate rating bounds (reject rating > 5 or < 1 with 400)', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          scaledContractId: contractId,
          rating: 10,
          comment: 'Invalid rating test.',
        })
        .expect(400);
    });

    it('should validate comment length (reject comment < 5 chars with 400)', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          scaledContractId: contractId,
          rating: 5,
          comment: 'Bad',
        })
        .expect(400);
    });
  });

  describe('Public Review Endpoints', () => {
    it('GET /reviews should return all reviews publicly with joined contract info', async () => {
      const res = await request(app.getHttpServer())
        .get('/reviews')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const review = res.body.find((r: any) => r.scaledContractId === contractId);
      expect(review).toBeDefined();
      expect(review.citizen.name).toBe('Aarav Citizen');
      expect(review.scaledContract.title).toBe('EV Fleet Optimization');
    });

    it('GET /reviews/contract/:id should return reviews for a specific contract', async () => {
      const res = await request(app.getHttpServer())
        .get(`/reviews/contract/${contractId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].rating).toBe(5);
      expect(res.body[0].citizen.name).toBe('Aarav Citizen');
    });

    it('GET /reviews/contract/:id/stats should return computed stats for a contract', async () => {
      const res = await request(app.getHttpServer())
        .get(`/reviews/contract/${contractId}/stats`)
        .expect(200);

      expect(res.body.scaledContractId).toBe(contractId);
      expect(res.body.avgRating).toBe(5);
      expect(res.body.reviewCount).toBe(1);
    });

    it('GET /scale/contracts should include avgRating and reviewCount', async () => {
      const res = await request(app.getHttpServer())
        .get('/scale/contracts')
        .expect(200);

      const contract = res.body.find((c: any) => c.id === contractId);
      expect(contract).toBeDefined();
      expect(contract.avgRating).toBe(5);
      expect(contract.reviewCount).toBe(1);
    });
  });
});
