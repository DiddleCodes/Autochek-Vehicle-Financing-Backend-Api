import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { inspect } from 'util';
export const errorHandler = (error: Record<string, any>, service: string) => {
  const logger = new Logger(service);
  Sentry.captureException(error);
  logger.error(
    inspect(error, {
      depth: 2,
      colors: true,
      compact: true,
      breakLength: 100,
    }),
  );
  if (error instanceof HttpException) {
    throw new HttpException(error.getResponse(), error.getStatus());
  } else {
    throw new HttpException(
      { ...error },
      error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export type ValuationPayload = {
      estimatedValue?: number;
      minValue?: number ;
      maxValue?: number ;
      metadata?: Record<string, any>;
    }
