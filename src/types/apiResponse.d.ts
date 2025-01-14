import { Anything, Json } from './json';

export interface ApiResponse {
  message: string | null;
  data: Json | null;
  /* Usually contains the error stack or a custom message shown only for non-prod environments */
  errors?: Anything;
  /* A special error code specific to this system */
  responseCode?: number | string;
  emooneedsCode?: string | null;
}
