import httpStatus from 'http-status';
import { ApiError } from '../../../utils/ApiError';
import logger from '../../../utils/logger';
import { Response } from 'express';
import { Anything } from '../../../types/json';
import { HttpError } from 'routing-controllers';
import config from '../../../config/config';
import { Service } from 'typedi';
// import errorMessages from '../../../constants/errorMessages';
import path from 'path';
import { promisify } from 'util';

interface sucessOptions {
  res: Response;
  message?: string;
  data?: Anything;
  status?: number;
}

interface failureOptions {
  res: Response;
  message?: string;
  status?: number;
  emooneedsCode?: string;
}

interface serverErrorOptions {
  res: Response;
  message?: string | string[];
  status?: number;
  emooneedsCode?: string;
  error: Error | ApiError | null | undefined | unknown;
}

interface validationErrorOptions {
  res: Response;
  message?: string;
  emooneedsCode?: string;
  status?: number;
  errors?: undefined | string[];
}

interface noDataFoundOptions {
  res: Response;
  message: string;
  data?: string | string[];
  status?: number;
  emooneedsCode?: string;
}

@Service()
export class ResponseService {
  // public devMode = config.showErrorStack;

  /* Success 2xx */
  /**
   * Sends a success message with optional message (OK default) data (null default) and status (200 default)
   * @param {sucessOptions} opts
   * @returns
   */
  public success(opts: sucessOptions) {
    const { res, message = httpStatus['200_NAME'], data = null, status = httpStatus.OK } = opts;
    return res.status(status).json({
      message,
      responseCode: status,
      data,
      error: null
    });
  }

  /**
   * Send a validation error message 422 code, with message , status and response
   * @param opts
   * @returns
   */
  public validationError(opts: validationErrorOptions) {
    const {
      res,
      message = httpStatus['422_NAME'],
      status = httpStatus.UNPROCESSABLE_ENTITY,
      emooneedsCode,
      errors = undefined
    } = opts;
    return res.status(status).json({
      message,
      emooneedsCode,
      errors,
      responseCode: status
    });
  }

  /* Client Failure 4xx */
  /**
   * Sends a client failure response with optional message (Bad Request default) and status (400 default)
   * @param {failureOptions} opts
   * @returns
   */
  failure(opts: failureOptions) {
    const {
      res,
      message = httpStatus['400_NAME'],
      status = httpStatus.BAD_REQUEST,
      emooneedsCode
    } = opts;
    return res.status(status).json({
      message,
      responseCode: status,
      emooneedsCode
    });
  }

  noDataFound(opts: noDataFoundOptions) {
    const {
      res,
      message = httpStatus['404_NAME'],
      status = httpStatus.NOT_FOUND,
      emooneedsCode
    } = opts;
    return res.status(status).json({
      message,
      emooneedsCode,
      responseCode: status,
      error: null
    });
  }

  async sendFile(opts) {
    const { res, rootPath } = opts;
    const absolutePath = path.resolve(rootPath);
    await promisify<string, void>(res.sendFile.bind(res))(absolutePath);
    return res;
  }

  /* Server Error 5xx */
  /**
   * Sends a server error with optional message (Internal Server Error Default)
   * and status (500 default)
   * @param {serverErrorOptions} opts
   * @returns
   */
  serverError(opts: serverErrorOptions) {
    const {
      res,
      message = httpStatus['500_NAME'],
      status = httpStatus.INTERNAL_SERVER_ERROR,
      emooneedsCode,
      error
    } = opts;
    let responseStatus = status;
    let responseMessage = message;
    let responseCode: string | number | undefined = status;
    let data;
    let responseemooneedsCode = emooneedsCode;
    if (error instanceof ApiError) {
      responseStatus = error.httpCode;
      responseCode = error.httpCode;
      responseMessage = error.message;
      responseemooneedsCode = error.emooneedsCode;
    }
    if (error instanceof HttpError) {
      responseStatus = error.httpCode;
      responseCode = error.httpCode;
      responseMessage = error.message;
      if (responseStatus === httpStatus.UNPROCESSABLE_ENTITY) {
        data = [error.message];
        responseMessage = httpStatus['500_NAME'];
      }
      // We're returning blitz code as well!
      responseemooneedsCode = error['emooneedsCode'];
    }
    status >= 500 && logger.error(error);
    return res.status(responseStatus).json({
      message: responseMessage,
      data,
      // error: thcis.devMode ? error instanceof Error && error.stack : null,
      responseCode: responseCode,
      emooneedsCode: responseemooneedsCode
    });
  }
}
