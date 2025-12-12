import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Offer } from './offer.entity';
import { EmploymentStatus, LoanStatus } from './enums';


@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  vehicleId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  requestedAmount: number; 

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  approvedAmount?: number; 

  @Column()
  applicantName: string;

  @Column()
  applicantAge: number;

  @Column({ nullable: true })
  applicantEmail?: string;

  @Column({ nullable: true })
  applicantPhone?: string;

  @Column({ nullable: true })
  applicantAddress?: string;

  @Column({ nullable: true })
  employmentStatus?: EmploymentStatus; 

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyIncome?: number;

  @Column({ nullable: true })
  creditScore?: number; 

  @Column({ default: false })
  isEligible: boolean; 

  @Column({ type: 'text', nullable: true })
  eligibilityReason?: string; // Reason for eligibility decision

  @Column({
    type: 'varchar',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  @Index()
  status: LoanStatus;

  @Column({ nullable: true })
  interestRate?: number; // Annual interest rate percentage

  @Column({ nullable: true })
  loanTerm?: number; // Loan term in months ( 12(1 year), 24, 36, 48, 60)

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>; // Additional loan metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.loans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @OneToMany(() => Offer, (offer) => offer.loan)
  offers: Offer[];
}
