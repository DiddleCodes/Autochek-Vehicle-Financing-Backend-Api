import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OffersService } from '../offers/offers.service';
import { Loan } from '../database/entities';
import { VehiclesService } from '../vehicles/vehicle.service';
import { CreateLoanDto, UpdateLoanStatusDto } from './dto/loans.dto';
import { ValuationsService } from '../valuations/valuation.service';
import { LoanStatus } from '../database/entities/enums';
import { ResponseHandler } from '../common/helpers/responseBuilder';
import { Response } from 'express';
import { errorHandler } from '../common/helpers/util.helpers';

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  score: number;
  recommendedAmount?: number;
}

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  // Eligibility criteria constants
  private readonly MIN_AGE = 18;
  private readonly MAX_AGE = 65;
  private readonly MIN_VEHICLE_VALUE = 5000;
  private readonly MAX_LTV_RATIO = 0.8;
  private readonly MIN_CREDIT_SCORE = 600;
  private readonly MIN_MONTHLY_INCOME = 2000;

  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly vehiclesService: VehiclesService,
    private readonly valuationsService: ValuationsService,
    @Inject(ResponseHandler) private readonly responseHandler: ResponseHandler,
    private readonly offersService: OffersService,
  ) {}

  /**
   * Creates a new loan application
   and performs eligibility check and generates offers if eligible
   */

  async create(dto: CreateLoanDto, res: Response): Promise<Response> {
    try {
      // Fetch vehicle & valuation
      const { vehicle, valuation } = await this.getVehicleAndValuation(
        dto.vehicleId,
      );

      if (!vehicle || !vehicle.isAvailable) {
        throw new BadRequestException('Vehicle is not available for financing');
      }

      // Ensure valuation exists
      const finalValuation =
        valuation ?? (await this.createFreshValuation(dto.vehicleId));

      // Eligibility check
      const eligibility = await this.checkEligibility(
        dto,
        finalValuation.estimatedValue,
      );

      // Create loan record in DB
      const loan = await this.loanRepository.save(
        this.loanRepository.create({
          ...dto,
          isEligible: eligibility.isEligible,
          eligibilityReason: eligibility.reasons.join('; '),
          status: eligibility.isEligible
            ? LoanStatus.UNDER_REVIEW
            : LoanStatus.REJECTED,
          approvedAmount: eligibility.recommendedAmount,
        }),
      );

      // We Generate loan offers ONLY if eligible
      if (eligibility.isEligible && eligibility.recommendedAmount) {
        await this.offersService.generateOffers(
          loan.id,
          eligibility.recommendedAmount,
          dto.loanTerm ?? 48,
        );
      }

      this.logger.log(`Loan created successfully: ${loan.id}`);

      return res
        .status(HttpStatus.CREATED)
        .json(
          this.responseHandler.respondWithSuccess(
            HttpStatus.CREATED,
            { loan },
            'Loan application created successfully',
          ),
        );
    } catch (error) {
      this.logger.error(error);
      return res
        .status(error.status || 500)
        .json(
          this.responseHandler.respondWithError(
            error.status || 500,
            error.message || 'Failed to update loan status',
          ),
        );
    }
  }

  async checkEligibility(
    application: CreateLoanDto,
    vehicleValue: number,
  ): Promise<EligibilityResult> {
    const reasons: string[] = [];
    let score = 100; // Start with perfect score

    // Age check
    if (
      application.applicantAge < this.MIN_AGE ||
      application.applicantAge > this.MAX_AGE
    ) {
      reasons.push(
        `Applicant age must be between ${this.MIN_AGE} and ${this.MAX_AGE}`,
      );
      score -= 50;
    }

    // Vehicle value check
    if (vehicleValue < this.MIN_VEHICLE_VALUE) {
      reasons.push(
        `Vehicle value ($${vehicleValue}) is below minimum ($${this.MIN_VEHICLE_VALUE})`,
      );
      score -= 40;
    }

    // Loan-to-Value ratio check
    const ltvRatio = application.requestedAmount / vehicleValue;
    if (ltvRatio > this.MAX_LTV_RATIO) {
      reasons.push(
        `Loan-to-value ratio (${(ltvRatio * 100).toFixed(1)}%) exceeds maximum (${this.MAX_LTV_RATIO * 100}%)`,
      );
      score -= 30;
    }

    // Credit score check (if provided)
    if (
      application.creditScore &&
      application.creditScore < this.MIN_CREDIT_SCORE
    ) {
      reasons.push(
        `Credit score (${application.creditScore}) is below minimum (${this.MIN_CREDIT_SCORE})`,
      );
      score -= 25;
    }

    // Monthly income check (if provided)
    if (
      application.monthlyIncome &&
      application.monthlyIncome < this.MIN_MONTHLY_INCOME
    ) {
      reasons.push(
        `Monthly income ($${application.monthlyIncome}) is below minimum ($${this.MIN_MONTHLY_INCOME})`,
      );
      score -= 20;
    }

    // Debt-to-income ratio check (simplified)
    if (application.monthlyIncome) {
      const estimatedMonthlyPayment =
        (application.requestedAmount * 1.05) / (application.loanTerm || 48);
      const dtiRatio = estimatedMonthlyPayment / application.monthlyIncome;

      if (dtiRatio > 0.4) {
        // 40% DTI limit
        reasons.push(
          `Estimated debt-to-income ratio (${(dtiRatio * 100).toFixed(1)}%) is too high`,
        );
        score -= 15;
      }
    }

    // Calculate recommended amount (80% of vehicle value or requested, whichever is lower)
    const maxLoanAmount = vehicleValue * this.MAX_LTV_RATIO;
    const recommendedAmount = Math.min(
      application.requestedAmount,
      maxLoanAmount,
    );

    const isEligible = score >= 50 && reasons.length === 0;

    if (isEligible) {
      reasons.push('Application meets all eligibility criteria');
    }

    return {
      isEligible,
      reasons,
      score,
      recommendedAmount: isEligible ? recommendedAmount : undefined,
    };
  }

  async getEligibility(id: string): Promise<{
    loan: Loan;
    eligibility: EligibilityResult;
  }> {
    const loan = await this.findOne(id);

    const valuation = await this.valuationsService.getLatestValuation(
      loan.vehicleId,
    );

    if (!valuation) {
      throw new BadRequestException('Vehicle valuation not found');
    }

    const eligibility = await this.checkEligibility(
      loan as any,
      valuation.estimatedValue,
    );

    return { loan, eligibility };
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    data: Loan[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [data, total] = await this.loanRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['vehicle', 'offers'],
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['vehicle', 'offers'],
    });
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }
    return loan;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateLoanStatusDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(
        `Updating loan ${id} to status ${updateStatusDto.status}`,
      );

      // Single DB fetch
      const loan = await this.loanRepository.findOne({
        where: { id },
      });

      if (!loan) {
        throw new NotFoundException(`Loan with ID ${id} not found`);
      }

      // Validate allowed status transitions
      this.validateStatusTransition(loan.status, updateStatusDto.status);

      loan.status = updateStatusDto.status;
      const updatedLoan = await this.loanRepository.save(loan);

      this.logger.log(`Loan ${id} status updated to ${loan.status}`);

      return res
        .status(HttpStatus.OK)
        .json(
          this.responseHandler.respondWithSuccess(
            HttpStatus.OK,
            { loan: updatedLoan },
            'Loan status updated successfully',
          ),
        );
    } catch (error) {
      this.logger.error(error.message || error);
      return res
        .status(error.status || 500)
        .json(
          this.responseHandler.respondWithError(
            error.status || 500,
            error.message || 'Failed to update loan status',
          ),
        );
    }
  }

  private validateStatusTransition(
    currentStatus: LoanStatus,
    newStatus: LoanStatus,
  ): void {
    const validTransitions: Record<LoanStatus, LoanStatus[]> = {
      [LoanStatus.PENDING]: [LoanStatus.UNDER_REVIEW, LoanStatus.REJECTED],
      [LoanStatus.UNDER_REVIEW]: [LoanStatus.APPROVED, LoanStatus.REJECTED],
      [LoanStatus.APPROVED]: [LoanStatus.DISBURSED, LoanStatus.REJECTED],
      [LoanStatus.REJECTED]: [], // Cannot transition from rejected
      [LoanStatus.DISBURSED]: [LoanStatus.ACTIVE],
      [LoanStatus.ACTIVE]: [LoanStatus.COMPLETED, LoanStatus.DEFAULTED],
      [LoanStatus.COMPLETED]: [], // Final state
      [LoanStatus.DEFAULTED]: [], // Final state
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async findLoansByStatus(status: LoanStatus): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { status },
      relations: ['vehicle', 'offers'],
      order: { createdAt: 'DESC' },
    });
  }

  private async getVehicleAndValuation(vehicleId: string) {
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    const valuation =
      await this.valuationsService.getLatestValuation(vehicleId);
    return { vehicle, valuation };
  }

  private async createFreshValuation(vehicleId: string) {
    return this.valuationsService.create({ vehicleId });
  }
}
