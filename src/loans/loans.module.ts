import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { ValuationsModule } from '../valuations/valuations.module';
import { VehiclesModule } from '../vehicles/vehicle.module';
import { Loan } from '../database/entities';
import { OffersModule } from '../offers/offers.module';
import { SharedModule } from '../common/helpers/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan]),
    VehiclesModule,
    ValuationsModule,
    OffersModule,
    SharedModule,
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
