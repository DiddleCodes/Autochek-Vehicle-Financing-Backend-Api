import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { OffersService } from './offers.service';

/**
 * Controller for loan offer endpoints
 * Handles offer retrieval, acceptance, and rejection
 */
@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get('loan/:loanId')
  @ApiOperation({
    summary: 'Get offers for a loan',
    description:
      'Retrieve all loan offers generated for a specific loan application. ' +
      'Offers are ordered by interest rate (best rate first).',
  })
  @ApiParam({
    name: 'loanId',
    type: String,
    description: 'Loan application ID',
  })
  @ApiResponse({
    description: 'Loan offers retrieved successfully',
  })
  async findByLoan(@Param('loanId') loanId: string) {
    return await this.offersService.findByLoan(loanId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer by ID',
    description: 'Retrieve detailed information about a specific loan offer.',
  })
  @ApiParam({ name: 'id',  type: String, description: 'Offer ID' })
  @ApiBadRequestResponse({ description: 'Offer details retrieved successfully'})
  async findOne(@Param('id') id: string) {
    return await this.offersService.findOne(id);
  }

  @Post(':id/accept')
  @ApiOperation({
    summary: 'Accept loan offer',
    description:
      'Accept a loan offer. This will automatically reject all other pending offers '
  })
  @ApiParam({ name: 'id',  type: String })
  @ApiResponse({
    description: 'Offer accepted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Offer cannot be accepted (expired or already processed)',
  })
  async acceptOffer(@Param('id') id: string) {
    return await this.offersService.acceptOffer(id);
  }

  @Post(':id/reject')
  @ApiOperation({
    summary: 'Reject loan offer',
    description:
      'Reject a loan offer. Offer must be in pending status. ' +
      'This does not affect other offers for the same loan.',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Offer rejected successfully',
  })
  @ApiBadRequestResponse({
    description: 'Offer cannot be rejected (already processed)',
  })
  async rejectOffer(@Param('id') id: string) {
    return await this.offersService.rejectOffer(id);
  }
}
