import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth & RBAC (e2e)', () => {
  jest.setTimeout(30000);

  let app: INestApplication<App>;
  let officerToken: string;
  let startupToken: string;
  let citizenToken: string;

  const timestamp = Date.now();
  const officerEmail = `officer_${timestamp}@dept.gov`;
  const startupEmail = `startup_${timestamp}@innovate.co`;
  const citizenEmail = `citizen_${timestamp}@citizen.org`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register an OFFICER successfully and return token without passwordHash', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: officerEmail,
          password: testPassword,
          name: 'Officer Rao',
          role: 'OFFICER',
          orgName: 'Department of Urban Mobility',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(officerEmail);
      expect(res.body.user.role).toBe('OFFICER');
      expect(res.body.user.orgName).toBe('Department of Urban Mobility');
      expect(res.body.user.passwordHash).toBeUndefined();

      officerToken = res.body.accessToken;
    });

    it('should register a STARTUP successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: startupEmail,
          password: testPassword,
          name: 'Priya Sharma',
          role: 'STARTUP',
          orgName: 'AgroSense Tech',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.role).toBe('STARTUP');
      startupToken = res.body.accessToken;
    });

    it('should register a CITIZEN successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: citizenEmail,
          password: testPassword,
          name: 'Aarav Patel',
          role: 'CITIZEN',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.role).toBe('CITIZEN');
      citizenToken = res.body.accessToken;
    });

    it('should reject registration with invalid email or short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: '123',
          name: 'Test',
          role: 'OFFICER',
        })
        .expect(400);
    });

    it('should reject registration with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: officerEmail,
          password: testPassword,
          name: 'Duplicate Officer',
          role: 'OFFICER',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should log in an existing user with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: officerEmail,
          password: testPassword,
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe(officerEmail);
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('should reject login with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: officerEmail,
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('should reject login for non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@dept.gov',
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('Role-Based Protected & Public Endpoints', () => {
    describe('POST /identify/needs (@Roles(OFFICER))', () => {
      it('should allow OFFICER to post a new need', async () => {
        const res = await request(app.getHttpServer())
          .post('/identify/needs')
          .set('Authorization', `Bearer ${officerToken}`)
          .send({
            dept: 'Urban Mobility',
            title: 'EV Charging Optimization',
            description: 'AI-based queue balancer for city buses',
            budget: '₹40L',
            domain: 'CleanTech',
          })
          .expect(201);

        expect(res.body.title).toBe('EV Charging Optimization');
      });

      it('should forbid STARTUP from posting a need (403)', async () => {
        await request(app.getHttpServer())
          .post('/identify/needs')
          .set('Authorization', `Bearer ${startupToken}`)
          .send({
            dept: 'Urban Mobility',
            title: 'Unauthorized Need',
            description: 'Test',
            budget: '₹10L',
            domain: 'CleanTech',
          })
          .expect(403);
      });

      it('should forbid CITIZEN from posting a need (403)', async () => {
        await request(app.getHttpServer())
          .post('/identify/needs')
          .set('Authorization', `Bearer ${citizenToken}`)
          .send({
            dept: 'Urban Mobility',
            title: 'Citizen Need',
            description: 'Test',
            budget: '₹10L',
            domain: 'CleanTech',
          })
          .expect(403);
      });

      it('should reject unauthenticated request (401)', async () => {
        await request(app.getHttpServer())
          .post('/identify/needs')
          .send({
            dept: 'Urban Mobility',
            title: 'Unauthenticated Need',
            description: 'Test',
            budget: '₹10L',
            domain: 'CleanTech',
          })
          .expect(401);
      });
    });

    describe('GET /identify/needs (Public)', () => {
      it('should allow public access without authentication', async () => {
        const res = await request(app.getHttpServer())
          .get('/identify/needs')
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    describe('POST /pilot/request (@Roles(STARTUP))', () => {
      it('should allow STARTUP to request a pilot', async () => {
        const res = await request(app.getHttpServer())
          .post('/pilot/request')
          .set('Authorization', `Bearer ${startupToken}`)
          .send({
            startup: 'AgroSense Tech',
            dept: 'Agriculture Dept',
            title: 'Soil Sensor Pilot',
            budget: '₹25L',
          })
          .expect(201);

        expect(res.body).toHaveProperty('card');
        expect(res.body.card.startup).toBe('AgroSense Tech');
      });

      it('should forbid OFFICER from requesting a pilot (403)', async () => {
        await request(app.getHttpServer())
          .post('/pilot/request')
          .set('Authorization', `Bearer ${officerToken}`)
          .send({
            startup: 'Officer Corp',
            dept: 'Agriculture Dept',
            title: 'Illegal Pilot',
            budget: '₹25L',
          })
          .expect(403);
      });

      it('should forbid CITIZEN from requesting a pilot (403)', async () => {
        await request(app.getHttpServer())
          .post('/pilot/request')
          .set('Authorization', `Bearer ${citizenToken}`)
          .send({
            startup: 'Citizen Corp',
            dept: 'Agriculture Dept',
            title: 'Illegal Pilot',
            budget: '₹25L',
          })
          .expect(403);
      });

      it('should reject unauthenticated pilot request (401)', async () => {
        await request(app.getHttpServer())
          .post('/pilot/request')
          .send({
            startup: 'Anon',
            dept: 'Agriculture Dept',
            title: 'Anon Pilot',
            budget: '₹25L',
          })
          .expect(401);
      });
    });

    describe('PATCH /pilot/advance (@Roles(OFFICER))', () => {
      let createdCardId: string;

      beforeAll(async () => {
        // Create a card via requestPilot to test advance
        const createRes = await request(app.getHttpServer())
          .post('/pilot/request')
          .set('Authorization', `Bearer ${startupToken}`)
          .send({
            startup: `AdvStartup_${Date.now()}`,
            dept: 'Health Dept',
            title: 'Health AI System',
            budget: '₹15L',
          });
        createdCardId = createRes.body.card.id;
      });

      it('should allow OFFICER to advance a pilot card', async () => {
        const res = await request(app.getHttpServer())
          .patch('/pilot/advance')
          .set('Authorization', `Bearer ${officerToken}`)
          .send({ cardId: createdCardId })
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });

      it('should forbid STARTUP from advancing a pilot card (403)', async () => {
        await request(app.getHttpServer())
          .patch('/pilot/advance')
          .set('Authorization', `Bearer ${startupToken}`)
          .send({ cardId: createdCardId })
          .expect(403);
      });

      it('should forbid CITIZEN from advancing a pilot card (403)', async () => {
        await request(app.getHttpServer())
          .patch('/pilot/advance')
          .set('Authorization', `Bearer ${citizenToken}`)
          .send({ cardId: createdCardId })
          .expect(403);
      });

      it('should reject unauthenticated advance request (401)', async () => {
        await request(app.getHttpServer())
          .patch('/pilot/advance')
          .send({ cardId: createdCardId })
          .expect(401);
      });
    });

    describe('GET /pilot/pipeline (Public)', () => {
      it('should allow public access to the pilot pipeline', async () => {
        const res = await request(app.getHttpServer())
          .get('/pilot/pipeline')
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });
  });
});
