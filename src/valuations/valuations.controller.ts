import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateValuationDto } from './dto/valuation.dto';
import { ValuationsService } from './valuation.service';

/**
 * Controller for vehicle valuation endpoints
 * Handles valuation requests and retrieval
 */
@ApiTags('valuations')
@Controller('valuations')
export class ValuationsController {
  constructor(private readonly valuationsService: ValuationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Request vehicle valuation',
    description:
      'Create a valuation request for a vehicle. The system will attempt to fetch ' +
      'real-time valuation from external API or use intelligent simulation.',
  })
  @ApiResponse({
    status: 201,
    description: 'Valuation created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  create(@Body() createValuationDto: CreateValuationDto) {
    return this.valuationsService.create(createValuationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all valuations',
    description: 'Retrieve a paginated list of all valuations.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of valuations retrieved successfully',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.valuationsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get valuation by ID',
    description: 'Retrieve detailed information about a specific valuation.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Valuation details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Valuation not found',
  })
  findOne(@Param('id') id: string) {
    return this.valuationsService.findOne(id);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({
    summary: 'Get valuations by vehicle',
    description: 'Retrieve all valuations for a specific vehicle.',
  })
  @ApiParam({
    name: 'vehicleId',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle valuations retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.valuationsService.findByVehicle(vehicleId);
  }
}
