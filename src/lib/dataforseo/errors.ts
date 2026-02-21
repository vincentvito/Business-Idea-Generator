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
    const code = error.statusCode;

    // HTTP-level status codes (2-3 digit)
    if (code === 401 || code === 403) {
      return {
        type: DataForSEOErrorType.AUTHENTICATION,
        message: "Invalid DataForSEO credentials. Check DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.",
        retryable: false,
      };
    }
    if (code === 402) {
      return {
        type: DataForSEOErrorType.QUOTA_EXCEEDED,
        message: "DataForSEO balance depleted. Add funds at dataforseo.com.",
        retryable: false,
      };
    }
    if (code === 429) {
      return {
        type: DataForSEOErrorType.RATE_LIMITED,
        message: "DataForSEO rate limit exceeded. Retrying shortly.",
        retryable: true,
      };
    }
    if (code >= 500 && code < 1000) {
      return {
        type: DataForSEOErrorType.NETWORK,
        message: "DataForSEO server error. Retrying shortly.",
        retryable: true,
      };
    }
    if (code === 400) {
      return {
        type: DataForSEOErrorType.INVALID_REQUEST,
        message: `Invalid request: ${error.message}`,
        retryable: false,
      };
    }

    // DataForSEO task-level status codes (5-digit, e.g. 40101, 40501)
    if (code >= 40100 && code < 40200) {
      return {
        type: DataForSEOErrorType.AUTHENTICATION,
        message: `DataForSEO auth error (${code}): ${error.message}`,
        retryable: false,
      };
    }
    if (code >= 40200 && code < 40300) {
      return {
        type: DataForSEOErrorType.QUOTA_EXCEEDED,
        message: `DataForSEO insufficient funds (${code}): ${error.message}`,
        retryable: false,
      };
    }
    if (code >= 42900 && code < 43000) {
      return {
        type: DataForSEOErrorType.RATE_LIMITED,
        message: `DataForSEO rate limited (${code}): ${error.message}`,
        retryable: true,
      };
    }
    if (code >= 50000) {
      return {
        type: DataForSEOErrorType.NETWORK,
        message: `DataForSEO internal error (${code}): ${error.message}`,
        retryable: true,
      };
    }
    if (code >= 40000) {
      return {
        type: DataForSEOErrorType.INVALID_REQUEST,
        message: `DataForSEO task error (${code}): ${error.message}`,
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
