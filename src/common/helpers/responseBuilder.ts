import { Injectable, HttpStatus } from '@nestjs/common';

export interface IResponse<T = void> {
  status: 'success' | 'fail';
  message: string;
  statusCode: HttpStatus;
  data: T | any;
  error: any;
  meta?: any;
}
@Injectable()
export class ResponseHandler {
  respondWithSuccess<T = any>(
    code = HttpStatus.OK,
    data: T,
    message = 'success',
  ): IResponse<T> {
    return {
      status: 'success',
      message,
      data,
      statusCode: code,
      error: null,
    };
  }

  respondWithError(
    errorName: string,
    errorCode = HttpStatus.INTERNAL_SERVER_ERROR,
    message = 'Unknown error',
    data: any = {},
  ): IResponse {
    return {
      status: 'fail',
      message,
      data,
      statusCode: errorCode,
      error: { name: errorName },
      meta: null,
    };
  }

  get HTTP_STATUS() {
    return HttpStatus;
  }
}
