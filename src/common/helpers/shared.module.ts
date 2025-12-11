import { Module } from '@nestjs/common';
import { ResponseHandler } from './responseBuilder';

@Module({
  providers: [ResponseHandler],
  exports: [ResponseHandler],
})
export class SharedModule {}
