import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './database/config.database';
import { LoansModule } from './loans/loans.module';
import { ValuationsModule } from './valuations/valuations.module';
import { VehiclesModule } from './vehicles/vehicle.module';
import { OffersModule } from './offers/offers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM database configuration with in-memory SQLite
    TypeOrmModule.forRoot(databaseConfig),

    // Feature modules
    VehiclesModule,
    ValuationsModule,
    LoansModule,
    OffersModule,
  ],
})
export class AppModule {}
