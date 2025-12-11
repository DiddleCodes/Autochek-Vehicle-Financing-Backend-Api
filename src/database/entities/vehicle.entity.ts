import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Valuation } from './valuation.entity';
import { Loan } from './loan.entity';


@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 17 })
  @Index()
  vin: string; 

  @Column()
  make: string

  @Column()
  model: string; 

  @Column()
  year: number; 

  @Column()
  mileage: number; 

  @Column({ nullable: true })
  color?: string; 

  @Column({ nullable: true })
  transmission?: string; 

  @Column({ nullable: true })
  fuelType?: string; 

  @Column({ nullable: true })
  engineSize?: string; 

  @Column({ nullable: true })
  condition?: string;

  @Column({ type: 'text', nullable: true })
  description?: string; 

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Valuation, (valuation) => valuation.vehicle)
  valuations: Valuation[];

  @OneToMany(() => Loan, (loan) => loan.vehicle)
  loans: Loan[];
}
