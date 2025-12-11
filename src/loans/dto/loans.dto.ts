import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Max,
  IsOptional,
  IsEmail,
  MinLength,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentStatus, LoanStatus } from '../../database/entities/enums';

/**
 * DTO for creating a loan application
 */
export class CreateLoanDto {
  @ApiProperty({
    description: 'Vehicle ID for loan',
    example: "1e92eb47-c145-4c6a-b107-f30d1059cea1",
  })
  @IsNotEmpty({ message: 'Vehicle ID is required' })
  @IsUUID('4', { message: 'Vehicle ID must be a valid UUID' })
  vehicleId: string;

  @ApiProperty({
    description: 'Requested loan amount',
    example: 15000,
    minimum: 1000,
  })
  @IsNotEmpty({ message: 'Requested amount is required' })
  @Type(() => Number)
  @IsNumber()
  @Min(1000, { message: 'Minimum loan amount is N100,000' })
  requestedAmount: number;

  @ApiProperty({
    description: 'Applicant full name',
    example: 'Samagabeyi Nduilor Musa',
    minLength: 2,
  })
  @IsNotEmpty({ message: 'Applicant name is required' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  applicantName: string;

  @ApiProperty({
    description: 'Applicant age',
    example: 30,
    minimum: 18,
    maximum: 65,
  })
  @IsNotEmpty({ message: 'Applicant age is required' })
  @Type(() => Number)
  @IsNumber()
  @Min(18, { message: 'Applicant must be at least 18 years old' })
  @Max(65, { message: 'Applicant must be 65 years old or younger' })
  applicantAge: number;

  @ApiPropertyOptional({
    description: 'Applicant email address',
    example: 'Samagabeyi.nduilor@yahoo.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  applicantEmail?: string;

  @ApiPropertyOptional({
    description: 'Applicant phone number',
    example: '+2347081513542',
  })
  @IsOptional()
  @IsString()
  applicantPhone?: string;

  @ApiPropertyOptional({
    description: 'Applicant residential address',
    example: '54. Adeniyi Jones Avenue, Ikeja, Lagos',
  })
  @IsOptional()
  @IsString()
  applicantAddress?: string;

  @ApiPropertyOptional({
    description: 'Employment status',
    example: 'Employed',
    enum: EmploymentStatus
  })
  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @ApiPropertyOptional({
    description: 'Monthly income in USD',
    example: 5000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Monthly income cannot be negative' })
  monthlyIncome?: number;

  @ApiPropertyOptional({
    description: 'Credit score (300-850)',
    example: 700,
    minimum: 300,
    maximum: 850,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(300, { message: 'Credit score must be at least 300' })
  @Max(850, { message: 'Credit score cannot exceed 850' })
  creditScore?: number;

  @ApiPropertyOptional({
    description: 'Preferred loan term in months',
    example: 48,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(12, { message: 'Minimum loan term is 12 months' })
  @Max(84, { message: 'Maximum loan term is 84 months' })
  loanTerm?: number;
}

export class UpdateLoanStatusDto {
  @ApiProperty({
    description: 'New loan status',
    enum: LoanStatus,
    example: LoanStatus.APPROVED,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(LoanStatus, { message: 'Invalid loan status' })
  status: LoanStatus;
}
