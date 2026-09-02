import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Budget Normalization (e2e)', () => {
  jest.setTimeout(30000);

  let app: INestApplication<App>;
  let officerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const officerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `budget_officer_${Date.now()}@dept.gov`,
        password: 'Password123!',
        name: 'Budget Officer',
        role: 'OFFICER',
      });
    officerToken = officerRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /identify/needs with raw unformatted budgets normalizes on return', async () => {
    // 1. Raw number without symbol
    const res1 = await request(app.getHttpServer())
      .post('/identify/needs')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        dept: 'Health',
        title: 'Need 45L',
        description: 'Test budget normalization',
        budget: '4500000',
        domain: 'HealthTech',
      })
      .expect(201);
    expect(res1.body.budget).toBe('₹45L');

    // 2. Unprefixed "30L"
    const res2 = await request(app.getHttpServer())
      .post('/identify/needs')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        dept: 'Health',
        title: 'Need 30L',
        description: 'Test budget normalization',
        budget: '30L',
        domain: 'HealthTech',
      })
      .expect(201);
    expect(res2.body.budget).toBe('₹30L');

    // 3. Crore unformatted "1.2Cr"
    const res3 = await request(app.getHttpServer())
      .post('/identify/needs')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        dept: 'Health',
        title: 'Need 1.2Cr',
        description: 'Test budget normalization',
        budget: '1.2Cr',
        domain: 'HealthTech',
      })
      .expect(201);
    expect(res3.body.budget).toBe('₹1.2Cr');
  });

  it('GET /identify/needs returns all budgets normalized with ₹ symbol and L/Cr suffix', async () => {
    const res = await request(app.getHttpServer())
      .get('/identify/needs')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    for (const need of res.body) {
      expect(need.budget).toMatch(/^₹\d+(\.\d+)?(L|Cr)$/);
    }
  });

  it('GET /pilot/pipeline returns all card budgets normalized', async () => {
    const res = await request(app.getHttpServer())
      .get('/pilot/pipeline')
      .expect(200);

    for (const col of res.body) {
      for (const card of col.cards) {
        expect(card.budget).toMatch(/^₹\d+(\.\d+)?(L|Cr)$/);
      }
    }
  });

  it('GET /scale/contracts returns pilotBudget and scaledBudget normalized', async () => {
    const res = await request(app.getHttpServer())
      .get('/scale/contracts')
      .expect(200);

    for (const contract of res.body) {
      expect(contract.pilotBudget).toMatch(/^₹\d+(\.\d+)?(L|Cr)$/);
      expect(contract.scaledBudget).toMatch(/^₹\d+(\.\d+)?(L|Cr)$/);
    }
  });

  it('GET /impact/summary returns totalScaledValueDisplay normalized', async () => {
    const res = await request(app.getHttpServer())
      .get('/impact/summary')
      .expect(200);

    expect(res.body).toHaveProperty('totalScaledValueDisplay');
    expect(res.body.totalScaledValueDisplay).toMatch(/^₹\d+(\.\d+)?(L|Cr)$/);
  });
});
