import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../database/entities';
import { OfferStatus } from '../database/entities/enums';

/**
 * Service for managing loan offers
 * Generates, accepts, and rejects loan offers
 */
@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  /**
   * Generate loan offers for a loan application
   * Creates multiple offers with different terms
   */
  async generateOffers(
    loanId: string,
    approvedAmount: number,
    preferredTerm = 48,
  ): Promise<Offer[]> {
    this.logger.log(`Generating offers for loan ID: ${loanId}`);

    const offers: Partial<Offer>[] = [];

    // Offer 1: Standard term with competitive rate
    const standardOffer = this.calculateOffer(
      loanId,
      approvedAmount,
      preferredTerm,
      6.5,
      'Prime Lender A',
    );
    offers.push(standardOffer);

    // Offer 2: Shorter term with lower rate
    if (preferredTerm > 36) {
      const shorterTermOffer = this.calculateOffer(
        loanId,
        approvedAmount,
        36,
        5.9,
        'Premium Lender B',
      );
      offers.push(shorterTermOffer);
    }

    // Offer 3: Longer term with higher rate
    if (preferredTerm < 60) {
      const longerTermOffer = this.calculateOffer(
        loanId,
        approvedAmount,
        60,
        7.2,
        'Flexible Lender C',
      );
      offers.push(longerTermOffer);
    }

    const savedOffers = await this.offerRepository.save(offers);

    this.logger.log(
      `Generated ${savedOffers.length} offers for loan ${loanId}`,
    );
    return savedOffers;
  }

  /**
   * Calculate offer details based on loan amount, term, and interest rate
   */
  private calculateOffer(
    loanId: string,
    amount: number,
    termMonths: number,
    annualRate: number,
    lenderName: string,
  ): Partial<Offer> {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    const totalPayment = monthlyPayment * termMonths;

    // Offer expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return {
      loanId,
      offerAmount: amount,
      interestRate: annualRate,
      loanTerm: termMonths,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      lenderName,
      status: OfferStatus.PENDING,
      expiresAt,
      terms: this.generateTermsAndConditions(amount, termMonths, annualRate),
    };
  }

  /**
   * Generate terms and conditions for an offer
   */
  private generateTermsAndConditions(
    amount: number,
    termMonths: number,
    rate: number,
  ): string {
    return `
This loan offer is subject to the following terms and conditions:

1. Loan Amount: $${amount.toLocaleString()}
2. Loan Term: ${termMonths} months
3. Annual Percentage Rate (APR): ${rate}%
4. This offer is valid for 30 days from the date of issuance
5. Final approval is subject to verification of all provided information
6. Early repayment penalties may apply
7. Late payment fees: $25 per occurrence
8. Vehicle will serve as collateral for the loan
9. Insurance is required for the duration of the loan
10. All terms are subject to final credit approval

By accepting this offer, you agree to all terms and conditions stated above.
    `.trim();
  }

  /**
   * Get all offers for a loan
   */
  async findByLoan(loanId: string): Promise<Offer[]> {
    this.logger.log(`Fetching offers for loan ID: ${loanId}`);

    const offers = await this.offerRepository.find({
      where: { loanId },
      order: { interestRate: 'ASC' }, // Order by best rate first
    });

    return offers;
  }

  /**
   * Get a single offer by ID
   */
  async findOne(id: string): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['loan'],
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  /**
   * Accept an offer
   */
  async acceptOffer(id: string): Promise<Offer> {
    this.logger.log(`Accepting offer ID: ${id}`);

    const offer = await this.findOne(id);

    // Check if offer is still valid
    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException(
        `Offer cannot be accepted. Current status: ${offer.status}`,
      );
    }

    if (offer.expiresAt && new Date() > offer.expiresAt) {
      offer.status = OfferStatus.EXPIRED;
      await this.offerRepository.save(offer);
      throw new BadRequestException('Offer has expired');
    }

    // Accept the offer
    offer.status = OfferStatus.ACCEPTED;
    const updatedOffer = await this.offerRepository.save(offer);

    // Reject all other pending offers for the same loan
    await this.offerRepository.update(
      {
        loanId: offer.loanId,
        id: { $ne: id } as any,
        status: OfferStatus.PENDING,
      },
      {
        status: OfferStatus.REJECTED,
      },
    );

    this.logger.log(`Offer ${id} accepted successfully`);
    return updatedOffer;
  }

  /**
   * Reject an offer
   */
  async rejectOffer(id: string): Promise<Offer> {
    this.logger.log(`Rejecting offer ID: ${id}`);

    const offer = await this.findOne(id);

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException(
        `Offer cannot be rejected. Current status: ${offer.status}`,
      );
    }

    offer.status = OfferStatus.REJECTED;
    const updatedOffer = await this.offerRepository.save(offer);

    this.logger.log(`Offer ${id} rejected successfully`);
    return updatedOffer;
  }

  /**
   * Check for expired offers and update their status
   */
  async updateExpiredOffers(): Promise<number> {
    const result = await this.offerRepository
      .createQueryBuilder()
      .update(Offer)
      .set({ status: OfferStatus.EXPIRED })
      .where('status = :status', { status: OfferStatus.PENDING })
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }
}
