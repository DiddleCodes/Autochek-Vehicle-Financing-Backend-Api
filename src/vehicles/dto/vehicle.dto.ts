import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  Length,
  IsOptional,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new vehicle
 * Validates vehicle data including VIN format and required fields
 */
export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle Identification Number (17 characters)',
    example: '1HGBH41JXMN109186',
    minLength: 17,
    maxLength: 17,
  })
  @IsNotEmpty({ message: 'VIN is required' })
  @IsString()
  @Length(17, 17, { message: 'VIN must be exactly 17 characters' })
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
    message: 'Invalid VIN format',
  })
  vin: string;

  @ApiProperty({
    description: 'Vehicle manufacturer',
    example: 'Toyota',
  })
  @IsNotEmpty({ message: 'Make is required' })
  @IsString()
  make: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Camry',
  })
  @IsNotEmpty({ message: 'Model is required' })
  @IsString()
  model: string;

  @ApiProperty({
    description: 'Manufacturing year',
    example: 2020,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
  })
  @IsNotEmpty({ message: 'Year is required' })
  @Type(() => Number)
  @IsNumber()
  @Min(1900, { message: 'Year must be 1900 or later' })
  @Max(new Date().getFullYear() + 1, {
    message: 'Year cannot be in the future',
  })
  year: number;

  @ApiProperty({
    description: 'Current mileage in kilometers',
    example: 50000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Mileage is required' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Mileage cannot be negative' })
  mileage: number;

  @ApiPropertyOptional({
    description: 'Vehicle color',
    example: 'Silver',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Transmission type',
    example: 'Automatic',
    enum: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'],
  })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional({
    description: 'Fuel type',
    example: 'Petrol',
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG'],
  })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({
    description: 'Engine displacement',
    example: '2.0L',
  })
  @IsOptional()
  @IsString()
  engineSize?: string;

  @ApiPropertyOptional({
    description: 'Vehicle condition',
    example: 'Good',
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    description: 'Additional vehicle description',
    example: 'Well-maintained vehicle with full service history',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether vehicle is available for financing',
    example: true,
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
