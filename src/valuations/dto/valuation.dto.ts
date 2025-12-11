import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a vehicle valuation request
 */
export class CreateValuationDto {
  @ApiProperty({
    description: 'Vehicle ID to valuate',
    example: 1,
  })
  @IsNotEmpty({ message: 'Vehicle ID is required' })
  @IsUUID('4', { message: 'Vehicle ID must be a valid UUID' })
  vehicleId: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the valuation',
    example: 'Requesting market value for financing purposes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
