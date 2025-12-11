import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ExternalValuationService {
  private readonly logger = new Logger(ExternalValuationService.name);

  private readonly rapidApiHost = process.env.RAPIDAPI_HOST;
  private readonly rapidApiKey = process.env.RAPIDAPI_KEY;

  constructor(private readonly http: HttpService) {}

  async fetchValuationByVin(vin: string): Promise<{
    estimatedValue: number;
    minValue?: number;
    maxValue?: number;
    metadata?: Record<string, any>;
  } | null> {
    if (!this.rapidApiHost || !this.rapidApiKey) {
      this.logger.debug(
        'No RapidAPI credentials supplied — skipping external lookup.',
      );
      return null;
    }

    try {
      this.logger.log(`Calling external valuation API for VIN ${vin}`);

      const url = `https://${this.rapidApiHost}/vehicle-lookup?vin=${encodeURIComponent(
        vin,
      )}`;

      const resp$ = this.http.get(url, {
        headers: {
          'x-rapidapi-key': this.rapidApiKey,
          'x-rapidapi-host': this.rapidApiHost,
          Accept: 'application/json',
        },
        timeout: 10_000,
      });

      const resp = await lastValueFrom(resp$);
      const data = resp.data;

      console.log("DATA", data)
      if (!data) {
        this.logger.warn(`No valuation data returned for VIN ${vin}`);
        return null;
      }

      const estimatedValue = Number(data.retail_value);

      if (!estimatedValue) {
        this.logger.warn(
          `External API returned no retail_value for VIN ${vin}`,
        );
        return {
          estimatedValue: null,
          metadata: data,
        } as any;
      }

      return {
        estimatedValue,
        minValue: Number(data.trade_in_value) || undefined,
        maxValue: Number(data.loan_value) || undefined,
        metadata: data,
      };
    } catch (err) {
      this.logger.warn(
        `External valuation lookup failed for VIN ${vin}: ${err?.message}`,
      );
      return null;
    }
  }
}
