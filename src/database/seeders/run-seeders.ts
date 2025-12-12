/* eslint-disable @typescript-eslint/no-floating-promises */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { Offer } from '../entities/offer.entity';
import { Loan, Valuation } from '../entities';
import {
  LoanStatus,
  OfferStatus,
  ValuationSource,
  ValuationStatus,
  EmploymentStatus,
} from '../entities/enums';

/**
 * Database seeder
 * Populates the database with sample data for testing
 */

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [Vehicle, Valuation, Loan, Offer],
  synchronize: true,
  logging: false,
});

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const vehicleRepository = AppDataSource.getRepository(Vehicle);
    const valuationRepository = AppDataSource.getRepository(Valuation);
    const loanRepository = AppDataSource.getRepository(Loan);
    const offerRepository = AppDataSource.getRepository(Offer);

    // Create sample vehicles
    console.log('Creating vehicles...');
    const vehicles = await vehicleRepository.save([
      {
        vin: '1HGBH41JXMN109186',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        mileage: 35000,
        color: 'Silver',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engineSize: '2.5L',
        condition: 'Good',
        description: 'Well-maintained sedan, single owner',
        isAvailable: true,
      },
      {
        vin: '2T3BF4DVXBW123456',
        make: 'Honda',
        model: 'Accord',
        year: 2019,
        mileage: 45000,
        color: 'Black',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engineSize: '2.0L',
        condition: 'Excellent',
        description: 'Low mileage, excellent condition',
        isAvailable: true,
      },
      {
        vin: '1FTFW1ET5BFA12345',
        make: 'Ford',
        model: 'F-150',
        year: 2021,
        mileage: 25000,
        color: 'Blue',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engineSize: '3.5L',
        condition: 'Excellent',
        description: 'Powerful pickup truck, barely used',
        isAvailable: true,
      },
      {
        vin: '5YJSA1E14HF123456',
        make: 'Tesla',
        model: 'Model S',
        year: 2018,
        mileage: 60000,
        color: 'White',
        transmission: 'Automatic',
        fuelType: 'Electric',
        engineSize: 'N/A',
        condition: 'Good',
        description: 'Electric vehicle with autopilot',
        isAvailable: true,
      },
      {
        vin: 'WDDGF8AB5EA123456',
        make: 'Mercedes-Benz',
        model: 'E-Class',
        year: 2017,
        mileage: 70000,
        color: 'Grey',
        transmission: 'Automatic',
        fuelType: 'Diesel',
        engineSize: '2.0L',
        condition: 'Fair',
        description: 'Luxury sedan, well maintained',
        isAvailable: false,
      },
    ]);
    console.log(`✅ Created ${vehicles.length} vehicles`);

    // Create valuations
    console.log('Creating valuations...');
    const valuations = await valuationRepository.save([
      {
        vehicleId: vehicles[0].id,
        estimatedValue: 22000,
        minValue: 20000,
        maxValue: 24000,
        source: ValuationSource.SIMULATED,
        status: ValuationStatus.COMPLETED,
        notes: 'Based on market analysis',
      },
      {
        vehicleId: vehicles[1].id,
        estimatedValue: 20000,
        minValue: 18000,
        maxValue: 22000,
        source: ValuationSource.SIMULATED,
        status: ValuationStatus.COMPLETED,
        notes: 'Excellent condition premium',
      },
      {
        vehicleId: vehicles[2].id,
        estimatedValue: 35000,
        minValue: 32000,
        maxValue: 38000,
        source: ValuationSource.SIMULATED,
        status: ValuationStatus.COMPLETED,
        notes: 'High demand vehicle',
      },
      {
        vehicleId: vehicles[3].id,
        estimatedValue: 28000,
        minValue: 25000,
        maxValue: 31000,
        source: ValuationSource.SIMULATED,
        status: ValuationStatus.COMPLETED,
        notes: 'Electric vehicle premium',
      },
    ]);
    console.log(`✅ Created ${valuations.length} valuations`);

    // Create loan applications
    console.log('Creating loan applications...');
    const loans = await loanRepository.save([
      {
        vehicleId: vehicles[0].id,
        requestedAmount: 18000,
        approvedAmount: 17600,
        applicantName: 'John Doe',
        applicantAge: 32,
        applicantEmail: 'john.doe@example.com',
        applicantPhone: '+1234567890',
        employmentStatus: EmploymentStatus.EMPLOYED,
        monthlyIncome: 5500,
        creditScore: 720,
        isEligible: true,
        eligibilityReason: 'Application meets all eligibility criteria',
        status: LoanStatus.APPROVED,
        interestRate: 6.5,
        loanTerm: 48,
      },
      {
        vehicleId: vehicles[1].id,
        requestedAmount: 16000,
        approvedAmount: 16000,
        applicantName: 'Jane Smith',
        applicantAge: 28,
        applicantEmail: 'jane.smith@example.com',
        applicantPhone: '+1234567891',
        employmentStatus: EmploymentStatus.SELF_EMPLOYED,
        monthlyIncome: 4800,
        creditScore: 680,
        isEligible: true,
        eligibilityReason: 'Application meets all eligibility criteria',
        status: LoanStatus.UNDER_REVIEW,
        loanTerm: 36,
      },
      {
        vehicleId: vehicles[2].id,
        requestedAmount: 30000,
        approvedAmount: 28000,
        applicantName: 'Bob Johnson',
        applicantAge: 45,
        applicantEmail: 'bob.johnson@example.com',
        applicantPhone: '+1234567892',
        employmentStatus: EmploymentStatus.EMPLOYED,
        monthlyIncome: 7200,
        creditScore: 750,
        isEligible: true,
        eligibilityReason: 'Application meets all eligibility criteria',
        status: LoanStatus.DISBURSED,
        interestRate: 5.9,
        loanTerm: 60,
      },
      {
        vehicleId: vehicles[3].id,
        requestedAmount: 25000,
        applicantName: 'Alice Williams',
        applicantAge: 23,
        applicantEmail: 'alice.w@example.com',
        applicantPhone: '+1234567893',
        employmentStatus: EmploymentStatus.EMPLOYED,
        monthlyIncome: 3200,
        creditScore: 580,
        isEligible: false,
        eligibilityReason:
          'Credit score (580) is below minimum (600); Estimated debt-to-income ratio (68.4%) is too high',
        status: LoanStatus.REJECTED,
      },
    ]);
    console.log(`✅ Created ${loans.length} loan applications`);

    // Create offers for approved loans
    console.log('Creating loan offers...');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const offers = await offerRepository.save([
      {
        loanId: loans[0].id,
        offerAmount: 17600,
        interestRate: 6.5,
        loanTerm: 48,
        monthlyPayment: 416.23,
        totalPayment: 19979.04,
        lenderName: 'Prime Lender A',
        status: OfferStatus.ACCEPTED,
        expiresAt,
        terms: 'Standard terms and conditions apply',
      },
      {
        loanId: loans[0].id,
        offerAmount: 17600,
        interestRate: 5.9,
        loanTerm: 36,
        monthlyPayment: 534.89,
        totalPayment: 19256.04,
        lenderName: 'Premium Lender B',
        status: OfferStatus.REJECTED,
        expiresAt,
        terms: 'Premium terms with lower rate',
      },
      {
        loanId: loans[1].id,
        offerAmount: 16000,
        interestRate: 6.8,
        loanTerm: 36,
        monthlyPayment: 491.52,
        totalPayment: 17694.72,
        lenderName: 'Prime Lender A',
        status: OfferStatus.PENDING,
        expiresAt,
        terms: 'Standard terms and conditions apply',
      },
      {
        loanId: loans[2].id,
        offerAmount: 28000,
        interestRate: 5.9,
        loanTerm: 60,
        monthlyPayment: 540.42,
        totalPayment: 32425.2,
        lenderName: 'Premium Lender B',
        status: OfferStatus.ACCEPTED,
        expiresAt,
        terms: 'Long-term financing option',
      },
    ]);
    console.log(`✅ Created ${offers.length} loan offers`);

    console.log(' Database seeding completed successfully!');
    console.log(' Summary:');
    console.log(`   - Vehicles: ${vehicles.length}`);
    console.log(`   - Valuations: ${valuations.length}`);
    console.log(`   - Loans: ${loans.length}`);
    console.log(`   - Offers: ${offers.length}`);
    console.log('\n💡 Note: This seeder uses in-memory database.');
    console.log('   Data will be lost when the application stops.');
    console.log(
      '   Consider integrating this into your main.ts for persistent seeding.\n',
    );

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();