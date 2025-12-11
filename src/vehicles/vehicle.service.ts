import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { Vehicle } from '../database/entities/vehicle.entity';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  responseHandler: any;

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
   // this.logger.log(`Creating new vehicle with VIN: ${createVehicleDto.vin}`);

    const existingVehicle = await this.vehicleRepository.findOne({
      where: { vin: createVehicleDto.vin },
    });

    if (existingVehicle) {
      throw new ConflictException(
        `Vehicle with VIN ${createVehicleDto.vin} already exists`,
      );
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    const savedVehicle = await this.vehicleRepository.save(vehicle);

    this.logger.log(`Vehicle created successfully with ID: ${savedVehicle.id}`);
    return savedVehicle;
  }

async findAll(page = 1, limit = 10, res: Response): Promise<Response> {
  try {
    this.logger.log(`Fetching vehicles - Page: ${page}, Limit: ${limit}`);

    const [data, total] = await this.vehicleRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const responsePayload = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return res.status(HttpStatus.OK).json(
      this.responseHandler.respondWithSuccess(
        HttpStatus.OK,
        responsePayload,
        'Vehicles fetched successfully',
      ),
    );
  } catch (error) {
    this.logger.error(error);

    return res.status(error.status || 500).json(
      this.responseHandler.respondWithError(
        error.status || 500,
        error.message || 'Failed to fetch vehicles',
      ),
    );
  }
}


  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['valuations', 'loans'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async findByVin(vin: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vin },
      relations: ['valuations', 'loans'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with VIN ${vin} not found`);
    }

    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
      const existingVehicle = await this.vehicleRepository.findOne({
        where: { vin: updateVehicleDto.vin },
      });

      if (existingVehicle) {
        throw new ConflictException(
          `Vehicle with VIN ${updateVehicleDto.vin} already exists`,
        );
      }
    }

    await this.vehicleRepository.update(id, updateVehicleDto)
    const updatedVehicle = await this.findOne(id);

    this.logger.log(`Vehicle updated successfully with ID: ${id}`);
    return updatedVehicle;
  }

async remove(id: string, res: any): Promise<Response> {
  try {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    await this.vehicleRepository.delete(id);
    return res.status(HttpStatus.OK).json(
      this.responseHandler.respondWithSuccess(
        HttpStatus.OK,
        null,
        'Vehicle deleted successfully',
      ),
    );
  } catch (error) {
    this.logger.error(error.message || error);
    return res.status(error.status || 500).json(
      this.responseHandler.respondWithError(
        error.status || 500,
        error.message || 'Failed to delete vehicle',
      ),
    );
  }
}


  async exists(id: string): Promise<boolean> {
    const count = await this.vehicleRepository.count({ where: { id } });
    return count > 0;
  }
}
