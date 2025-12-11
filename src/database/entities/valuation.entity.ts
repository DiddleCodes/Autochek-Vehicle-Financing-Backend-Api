import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { ValuationSource, ValuationStatus } from './enums';


@Entity('valuations')
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  vehicleId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  estimatedValue: number; 

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minValue?: number; // Minimum estimated value

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxValue?: number; // Maximum estimated value

  @Column({
    type: 'varchar',
    enum: ValuationSource,
    default: ValuationSource.SIMULATED,
  })
  source: ValuationSource; // Source of valuation

  @Column({
    type: 'varchar',
    enum: ValuationStatus,
    default: ValuationStatus.PENDING,
  })
  status: ValuationStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string; // Additional notes about the valuation

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>; //  Metadata from external API

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.valuations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;
}
