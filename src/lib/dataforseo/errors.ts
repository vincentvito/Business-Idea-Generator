import { DataForSEOError } from "./client";

export enum DataForSEOErrorType {
  AUTHENTICATION = "AUTHENTICATION",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  RATE_LIMITED = "RATE_LIMITED",
  NETWORK = "NETWORK",
  INVALID_REQUEST = "INVALID_REQUEST",
  UNKNOWN = "UNKNOWN",
}

interface ClassifiedError {
  type: DataForSEOErrorType;
  message: string;
  retryable: boolean;
}

export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof DataForSEOError) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return {
        type: DataForSEOErrorType.AUTHENTICATION,
        message: "Invalid DataForSEO credentials. Check DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.",
        retryable: false,
      };
    }
    if (error.statusCode === 402) {
      return {
        type: DataForSEOErrorType.QUOTA_EXCEEDED,
        message: "DataForSEO balance depleted. Add funds at dataforseo.com.",
        retryable: false,
      };
    }
    if (error.statusCode === 429) {
      return {
        type: DataForSEOErrorType.RATE_LIMITED,
        message: "DataForSEO rate limit exceeded. Retrying shortly.",
        retryable: true,
      };
    }
    if (error.statusCode >= 500) {
      return {
        type: DataForSEOErrorType.NETWORK,
        message: "DataForSEO server error. Retrying shortly.",
        retryable: true,
      };
    }
    if (error.statusCode === 400) {
      return {
        type: DataForSEOErrorType.INVALID_REQUEST,
        message: `Invalid request: ${error.message}`,
        retryable: false,
      };
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("econnrefused") ||
      msg.includes("enotfound") ||
      msg.includes("etimedout") ||
      msg.includes("fetch failed")
    ) {
      return {
        type: DataForSEOErrorType.NETWORK,
        message: "Cannot reach DataForSEO API. Check your internet connection.",
        retryable: true,
      };
    }
    return {
      type: DataForSEOErrorType.UNKNOWN,
      message: error.message,
      retryable: false,
    };
  }

  return {
    type: DataForSEOErrorType.UNKNOWN,
    message: String(error),
    retryable: false,
  };
}

export function shouldRetry(error: unknown): boolean {
  return classifyError(error).retryable;
}
