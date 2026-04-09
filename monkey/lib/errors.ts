export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: Record<string, string[]>) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} con ID ${id} no encontrado` : `${resource} no encontrado`,
      404
    );
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Demasiadas solicitudes. Intenta más tarde') {
    super('RATE_LIMIT', message, 429);
    this.name = 'RateLimitError';
  }
}

import { ZodError } from 'zod';

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && { details: error.details }),
      },
    };
  }

  if (error instanceof ZodError) {
    const details = error.errors.reduce<Record<string, string[]>>((acc, issue) => {
      const pathKey = issue.path.join('.') || 'input'
      acc[pathKey] = acc[pathKey] || []
      acc[pathKey].push(issue.message)
      return acc
    }, {})

    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validación de datos fallida',
        details,
      },
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'Error desconocido',
    },
  };
};
