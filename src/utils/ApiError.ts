import { HttpError } from 'routing-controllers';

export class ApiError extends HttpError {
  emooneedsCode?: string | undefined;
  constructor(status: number, message?: string, emooneedsCode?: string) {
    super(status, message);
    this.emooneedsCode = emooneedsCode;
  }
}
