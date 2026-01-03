export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_AUTH_FORMAT: 'INVALID_AUTH_FORMAT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  STRATEGY_NOT_FOUND: 'STRATEGY_NOT_FOUND',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  JUPITER_QUOTE_FAILED: 'JUPITER_QUOTE_FAILED',
  JUPITER_SWAP_FAILED: 'JUPITER_SWAP_FAILED',
  JITO_BUNDLE_FAILED: 'JITO_BUNDLE_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

export class AppError extends Error {
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details })
    };
  }
}

export const createError = {
  unauthorized: (message = 'Unauthorized') =>
    new AppError(ErrorCodes.UNAUTHORIZED, message, 401),

  forbidden: (message = 'Forbidden') =>
    new AppError(ErrorCodes.FORBIDDEN, message, 403),

  invalidAuthFormat: (message = 'Invalid authorization format') =>
    new AppError(ErrorCodes.INVALID_AUTH_FORMAT, message, 401),

  rateLimitExceeded: (message = 'Rate limit exceeded', retryAfter = 60) =>
    new AppError(ErrorCodes.RATE_LIMIT_EXCEEDED, message, 429, { retryAfter }),

  validationError: (message, details = null) =>
    new AppError(ErrorCodes.VALIDATION_ERROR, message, 400, details),

  walletNotFound: (publicKey) =>
    new AppError(ErrorCodes.WALLET_NOT_FOUND, `Wallet not found: ${publicKey}`, 404),

  strategyNotFound: (strategyId) =>
    new AppError(ErrorCodes.STRATEGY_NOT_FOUND, `Strategy not found: ${strategyId}`, 404),

  insufficientBalance: (required, available) =>
    new AppError(
      ErrorCodes.INSUFFICIENT_BALANCE,
      `Insufficient balance. Required: ${required}, Available: ${available}`,
      400,
      { required, available }
    ),

  jupiterQuoteFailed: (message, details = null) =>
    new AppError(ErrorCodes.JUPITER_QUOTE_FAILED, message, 502, details),

  jupiterSwapFailed: (message, details = null) =>
    new AppError(ErrorCodes.JUPITER_SWAP_FAILED, message, 502, details),

  jitoBundleFailed: (message, details = null) =>
    new AppError(ErrorCodes.JITO_BUNDLE_FAILED, message, 502, details),

  transactionFailed: (message, signature = null) =>
    new AppError(ErrorCodes.TRANSACTION_FAILED, message, 500, { signature }),

  encryptionFailed: (message) =>
    new AppError(ErrorCodes.ENCRYPTION_FAILED, message, 500),

  decryptionFailed: (message) =>
    new AppError(ErrorCodes.DECRYPTION_FAILED, message, 500),

  databaseError: (message) =>
    new AppError(ErrorCodes.DATABASE_ERROR, message, 500),

  internalError: (message = 'Internal server error') =>
    new AppError(ErrorCodes.INTERNAL_SERVER_ERROR, message, 500)
};

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: ErrorCodes.VALIDATION_ERROR,
      message: err.message,
      details: err.details || null
    });
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: ErrorCodes.INTERNAL_SERVER_ERROR,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
