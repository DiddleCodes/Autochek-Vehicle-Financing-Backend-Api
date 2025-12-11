/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Autochek API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same configuration as main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Vehicles API', () => {
    let vehicleId: number;

    it('POST /api/vehicles - should create a new vehicle', () => {
      return request(app.getHttpServer())
        .post('/api/vehicles')
        .send({
          vin: '1HGBH41JXMN109186',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          mileage: 35000,
          color: 'Silver',
          transmission: 'Automatic',
          fuelType: 'Petrol',
          condition: 'Good',
        })
        .expect(201)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.vin).toBe('1HGBH41JXMN109186');
          vehicleId = response.body.data.id;
        });
    });

    it('POST /api/vehicles - should reject duplicate VIN', () => {
      return request(app.getHttpServer())
        .post('/api/vehicles')
        .send({
          vin: '1HGBH41JXMN109186',
          make: 'Honda',
          model: 'Accord',
          year: 2019,
          mileage: 45000,
        })
        .expect(409);
    });

    it('POST /api/vehicles - should reject invalid VIN format', () => {
      return request(app.getHttpServer())
        .post('/api/vehicles')
        .send({
          vin: 'INVALID',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          mileage: 35000,
        })
        .expect(400);
    });

    it('GET /api/vehicles - should return all vehicles', () => {
      return request(app.getHttpServer())
        .get('/api/vehicles')
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('data');
          expect(Array.isArray(response.body.data.data)).toBe(true);
          expect(response.body.data.total).toBeGreaterThan(0);
        });
    });

    it('GET /api/vehicles/:id - should return a specific vehicle', () => {
      return request(app.getHttpServer())
        .get(`/api/vehicles/${vehicleId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data.id).toBe(vehicleId);
        });
    });

    it('PATCH /api/vehicles/:id - should update a vehicle', () => {
      return request(app.getHttpServer())
        .patch(`/api/vehicles/${vehicleId}`)
        .send({ mileage: 40000 })
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data.mileage).toBe(40000);
        });
    });

    it('GET /api/vehicles/999 - should return 404 for non-existent vehicle', () => {
      return request(app.getHttpServer()).get('/api/vehicles/999').expect(404);
    });
  });

  describe('Valuations API', () => {
    let vehicleId: number;
    let valuationId: number;

    beforeAll(async () => {
      // Create a vehicle for valuation tests
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .send({
          vin: '2T3BF4DVXBW123456',
          make: 'Honda',
          model: 'Accord',
          year: 2019,
          mileage: 45000,
        });
      vehicleId = response.body.data.id;
    });

    it('POST /api/valuations - should create a valuation', () => {
      return request(app.getHttpServer())
        .post('/api/valuations')
        .send({
          vehicleId,
          notes: 'Test valuation',
        })
        .expect(201)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data).toHaveProperty('estimatedValue');
          valuationId = response.body.data.id;
        });
    });

    it('GET /api/valuations/:id - should return a valuation', () => {
      return request(app.getHttpServer())
        .get(`/api/valuations/${valuationId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data.id).toBe(valuationId);
        });
    });

    it('GET /api/valuations/vehicle/:vehicleId - should return vehicle valuations', () => {
      return request(app.getHttpServer())
        .get(`/api/valuations/vehicle/${vehicleId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
  });

  describe('Loans API', () => {
    let vehicleId: number;
    let loanId: number;

    beforeAll(async () => {
      // Create a vehicle for loan tests
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .send({
          vin: '1FTFW1ET5BFA12345',
          make: 'Ford',
          model: 'F-150',
          year: 2021,
          mileage: 25000,
        });
      vehicleId = response.body.data.id;
    });

    it('POST /api/loans - should create a loan application', () => {
      return request(app.getHttpServer())
        .post('/api/loans')
        .send({
          vehicleId,
          requestedAmount: 20000,
          applicantName: 'Test User',
          applicantAge: 30,
          applicantEmail: 'test@example.com',
          monthlyIncome: 5000,
          creditScore: 700,
        })
        .expect(201)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data).toHaveProperty('isEligible');
          loanId = response.body.data.id;
        });
    });

    it('GET /api/loans/:id - should return a loan', () => {
      return request(app.getHttpServer())
        .get(`/api/loans/${loanId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data.id).toBe(loanId);
        });
    });

    it('GET /api/loans/:id/eligibility - should return eligibility details', () => {
      return request(app.getHttpServer())
        .get(`/api/loans/${loanId}/eligibility`)
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('loan');
          expect(response.body.data).toHaveProperty('eligibility');
        });
    });

    it('POST /api/loans - should reject applicant under 18', () => {
      return request(app.getHttpServer())
        .post('/api/loans')
        .send({
          vehicleId,
          requestedAmount: 20000,
          applicantName: 'Young Person',
          applicantAge: 17,
        })
        .expect(400);
    });
  });

  describe('Offers API', () => {
    let vehicleId: number;
    let loanId: number;

    beforeAll(async () => {
      // Create vehicle and eligible loan
      const vehicleResponse = await request(app.getHttpServer())
        .post('/api/vehicles')
        .send({
          vin: '5YJSA1E14HF123456',
          make: 'Tesla',
          model: 'Model S',
          year: 2020,
          mileage: 30000,
        });
      vehicleId = vehicleResponse.body.data.id;

      const loanResponse = await request(app.getHttpServer())
        .post('/api/loans')
        .send({
          vehicleId,
          requestedAmount: 25000,
          applicantName: 'Eligible User',
          applicantAge: 35,
          applicantEmail: 'eligible@example.com',
          monthlyIncome: 7000,
          creditScore: 750,
        });
      loanId = loanResponse.body.data.id;
    });

    it('GET /api/offers/loan/:loanId - should return offers for eligible loan', () => {
      return request(app.getHttpServer())
        .get(`/api/offers/loan/${loanId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(Array.isArray(response.body.data)).toBe(true);
          if (response.body.data.length > 0) {
            expect(response.body.data[0]).toHaveProperty('offerAmount');
            expect(response.body.data[0]).toHaveProperty('interestRate');
          }
        });
    });
  });
});
