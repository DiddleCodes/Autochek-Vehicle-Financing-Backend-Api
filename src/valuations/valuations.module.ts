import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesModule } from '../vehicles/vehicle.module';
import { Valuation } from '../database/entities';
import { ValuationsController } from './valuations.controller';
import { ValuationsService } from './valuation.service';
import { ExternalValuationService } from './external-valuation.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Valuation]), VehiclesModule, HttpModule],
  controllers: [ValuationsController],
  providers: [ValuationsService, ExternalValuationService],
  exports: [ValuationsService],
})
export class ValuationsModule {}
