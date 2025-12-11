import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { CreateLoanDto, UpdateLoanStatusDto } from './dto/loans.dto';
import type { Response } from 'express';

/**
 * Controller for loan application endpoints
 * Handles loan submission, status updates, and eligibility checks
 */
@ApiTags('loans')
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Submit loan application' })
  @ApiCreatedResponse({ description: 'Loan application submitted successfully'})
  @ApiBadRequestResponse({ description: 'Invalid input data or vehicle not available'})
  async create(
    @Body() createLoanDto: CreateLoanDto,
    @Res() res: Response,
  ): Promise<Response> {
    return await this.loansService.create(createLoanDto, res);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all loan applications',
    description: 'Retrieve a paginated list of all loan applications.',
  })
  @ApiQuery({ name: 'page', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, example: 10 })
  @ApiResponse({ description: 'List of loan applications retrieved successfully',})
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return await this.loansService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get loan application by ID',
    description: 'Retrieve detailed information about a specific loan application'})
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ description: 'Loan application details retrieved successfully'})
  @ApiBadRequestResponse({ description: 'Loan application not found'})
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return await this.loansService.findOne(id);
  }

  @Get(':id/eligibility')
  @ApiOperation({
    summary: 'Check loan eligibility',
    description:
    'Get detailed eligibility information for a loan application, ',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ description: 'Eligibility information retrieved successfully'})
  @ApiBadRequestResponse({ description: 'Loan application not found',})
  async getEligibility(@Param('id') id: string) {
    return await this.loansService.getEligibility(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update loan status',
    description:
      'Update the status of a loan application. Status transitions are validated ' 
  })
  @ApiParam({ name: 'id',type: String})
  @ApiResponse({ description: 'Loan status updated successfully',})
  @ApiBadRequestResponse({  description: 'Invalid status transition'})
 async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateLoanStatusDto,
    res: Response,
  ) {
    return await this.loansService.updateStatus(id, updateStatusDto, res);
  }
}
