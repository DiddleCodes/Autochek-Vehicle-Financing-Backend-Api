import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Loan } from './loan.entity';
import { OfferStatus } from './enums';

/**
 * Offer Model representing a loan offer
 * Generated based on loan eligibility and vehicle valuation
 */

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  loanId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  offerAmount: number; // Offered loan amount

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number; // Annual interest rate (%)

  @Column()
  loanTerm: number; // Loan term in months

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlyPayment: number; // Calculated monthly payment

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPayment: number; // Total amount to be repaid

  @Column({ nullable: true })
  lenderName?: string; // Name of the lending institution

  @Column({
    type: 'varchar',
    enum: OfferStatus,
    default: OfferStatus.PENDING,
  })
  @Index()
  status: OfferStatus;

  @Column({ type: 'datetime', nullable: true })
  expiresAt?: Date; // Offer expiration date

  @Column({ type: 'text', nullable: true })
  terms?: string; // Additional terms and conditions

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>; // Additional offer metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Loan, (loan) => loan.offers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loanId' })
  loan: Loan;
}
