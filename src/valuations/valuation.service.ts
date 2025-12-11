// src/valuations/valuations.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Valuation } from '../database/entities/valuation.entity';
import { Vehicle } from '../database/entities/vehicle.entity';
import { CreateValuationDto } from './dto/valuation.dto';
import { ExternalValuationService } from './external-valuation.service';
import { ValuationSource, ValuationStatus } from '../database/entities/enums';
import { Number } from 'mongoose';
import { ValuationPayload } from '../common/helpers/util.helpers';

@Injectable()
export class ValuationsService {
  private readonly logger = new Logger(ValuationsService.name);

  constructor(
    @InjectRepository(Valuation)
    private readonly valuationRepo: Repository<Valuation>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    private readonly externalValuation: ExternalValuationService,
  ) {}


  async create(dto: CreateValuationDto): Promise<Valuation> {
    const { vehicleId, notes } = dto;

    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      this.logger.warn(
        `Vehicle ${vehicleId} not found when creating valuation`,
      );
      throw new NotFoundException(`Vehicle with id ${vehicleId} not found`);
    }

    let valuationPayload: ValuationPayload = {};

    if (vehicle.vin) {
      valuationPayload = await this.externalValuation.fetchValuationByVin(
        vehicle.vin,
      ) as ValuationPayload;
    }

// Check if there is an error with the above, then simulate,
   if (Object.values(valuationPayload).length) {
      const simulated = this.simulateValuation(vehicle);
      valuationPayload = {
        estimatedValue: simulated.estimatedValue,
        minValue: simulated.minValue,
        maxValue: simulated.maxValue,
        metadata: { simulated: true, factors: simulated.factors },
      };
    }

    const valuation = this.valuationRepo.create({
      vehicleId: vehicle.id,
      estimatedValue: valuationPayload?.estimatedValue
        ? this.toTwoDecimal(valuationPayload?.estimatedValue)
        : undefined,
      minValue: valuationPayload?.minValue
        ? this.toTwoDecimal(valuationPayload?.minValue)
        : undefined,
      maxValue: valuationPayload?.maxValue
        ? this.toTwoDecimal(valuationPayload?.maxValue)
        : undefined,
      source: valuationPayload?.metadata?.simulated
        ? ValuationSource.SIMULATED
        : ValuationSource.EXTERNAL_API,
      status: ValuationStatus.COMPLETED,
      notes: notes ?? null,
      metadata: valuationPayload?.metadata ?? null,
    } as Partial<Valuation>);

    const saved = await this.valuationRepo.save(valuation);
    this.logger.log(`Saved valuation ${saved.id} for vehicle ${vehicle.id}`);
    return saved;
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    data: Valuation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const take = Math.max(1, limit);
    const skip = (Math.max(1, page) - 1) * take;

    const [data, total] = await this.valuationRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take,
      relations: ['vehicle'],
    });

    return { data, total, page, limit: take };
  }

  async findOne(id: string): Promise<Valuation> {
    const val = await this.valuationRepo.findOne({
      where: { id },
      relations: ['vehicle'],
    });
    if (!val) throw new NotFoundException(`Valuation with id ${id} not found`);
    return val;
  }

  async findByVehicle(vehicleId: string): Promise<Valuation[]> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle)
      throw new NotFoundException(`Vehicle with id ${vehicleId} not found`);

    return this.valuationRepo.find({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });
  }

  async getLatestValuation(vehicleId: string): Promise<Valuation | null> {
    this.logger.log(`Fetching latest valuation for vehicle ${vehicleId}`);

    const valuation = await this.valuationRepo.findOne({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });

    if (!valuation) {
      this.logger.warn(`No valuation found for vehicle ${vehicleId}`);
      return null;
    }

    return valuation;
  }

  private toTwoDecimal(value: number): number {
    return Math.round(value * 100) / 100;
  }


  private simulateValuation(vehicle: Vehicle): {
    estimatedValue: number;
    minValue: number;
    maxValue: number;
    factors: Record<string, any>;
  } {
    const currentYear = new Date().getFullYear();
    const age = currentYear - (vehicle.year || currentYear);
    const baseByAge = Math.max(1_500, 30_000 - age * 1_500); // crude base
    // small make/model adjustments (you could expand with a lookup table)
    const makeScore = this.brandFactor(vehicle.make);
    const mileage = vehicle.mileage ?? 0;
    const mileageFactor = Math.max(
      0.45,
      1 - Math.min(300_000, mileage) / 300_000,
    ); // 0.45..1.0
    const conditionFactor = this.conditionFactor(vehicle.condition);
    const engineFactor = vehicle.engineSize
      ? 1 +
        Math.min(
          0.15,
          parseFloat(String(vehicle.engineSize).replace('L', '')) * 0.03,
        )
      : 1;

    const raw =
      baseByAge * makeScore * mileageFactor * conditionFactor * engineFactor;

    // Spread bounds +/- 7-12%
    const spread = Math.max(0.07, Math.min(0.12, age * 0.005 + 0.07));
    const minVal = raw * (1 - spread);
    const maxVal = raw * (1 + spread);

    const estimatedValue = Math.max(800, raw); // floor
    return {
      estimatedValue: this.toTwoDecimal(estimatedValue),
      minValue: this.toTwoDecimal(minVal),
      maxValue: this.toTwoDecimal(maxVal),
      factors: {
        age,
        baseByAge,
        makeScore,
        mileage,
        mileageFactor,
        conditionFactor,
        engineFactor,
        spread,
      },
    };
  }

  private brandFactor(make?: string): number {
    if (!make) return 0.9;
    const m = make.toLowerCase();
    if (m.includes('toyota') || m.includes('honda') || m.includes('bmw'))
      return 1.05;
    if (m.includes('mercedes') || m.includes('audi')) return 1.1;
    if (m.includes('nissan') || m.includes('kia') || m.includes('hyundai'))
      return 0.95;
    return 0.9;
  }

  private conditionFactor(condition?: string): number {
    if (!condition) return 0.9;
    const c = condition.toLowerCase();
    if (c.includes('excellent')) return 1.05;
    if (c.includes('good')) return 1.0;
    if (c.includes('fair')) return 0.9;
    if (c.includes('poor')) return 0.75;
    return 0.9;
  }
}
