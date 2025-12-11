import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Vehicle } from '../database/entities/vehicle.entity';
import { Offer } from '../database/entities/offer.entity';
import { Valuation, Loan } from './entities';


export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'data/autocheck.db',
  entities: [Vehicle, Valuation, Loan, Offer],
  synchronize: true, 
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
  dropSchema: false,
};
