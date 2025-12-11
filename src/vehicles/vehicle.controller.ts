import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  Res,
} from '@nestjs/common';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { VehiclesService } from './vehicle.service';
import type { Request, Response } from 'express';


@ApiTags('vehicles')
@Controller('v1/vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new vehicle',
    description: 'Registers a new vehicle in the system.',
  })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

@Get()
@ApiOperation({
  summary: 'Get all vehicles',
  description: 'Returns a paginated list of vehicles.',
})
@ApiQuery({ name: 'page', required: false, example: 1 })
@ApiQuery({ name: 'limit', required: false, example: 10 })
async findAll(
  @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  @Res() res: Response,
) {
  return await this.vehiclesService.findAll(page, limit, res);
}


  @Get(':id')
  @ApiOperation({
    summary: 'Get a vehicle by ID',
    description: 'Returns a single vehicle including valuations & loans.',
  })
  @ApiParam({
    name: 'id',
    example: '5f66f282-8ac3-4ee8-bbdc-4201c4b50dfa',
  })
  async findOne(@Param('id') id: string) {
    return await this.vehiclesService.findOne(id);
  }

  @Get('vin/:vin')
  @ApiOperation({
    summary: 'Get a vehicle by VIN',
    description: 'Returns vehicle data using the 17-character VIN.',
  })
  @ApiParam({ name: 'vin', example: '2HGFB2F50EH512345' })
  findByVin(@Param('vin') vin: string) {
    return this.vehiclesService.findByVin(vin);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a vehicle',
    description: 'Edits an existing vehicle record.',
  })
  @ApiParam({ name: 'id', example: 1 })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

@Delete(':id')
@ApiOperation({
  summary: 'Delete a vehicle',
  description: 'Permanently removes a vehicle record.',
})
@ApiParam({ name: 'id', example: 'uuid-here' })
async remove(@Param('id') id: string, @Res() res: Response) {
  return this.vehiclesService.remove(id, res);
}
}
