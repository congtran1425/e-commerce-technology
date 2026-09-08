import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/app-error.js';

function isInvalidJsonError(error: unknown): error is SyntaxError & { status: number; type: string } {
  return error instanceof SyntaxError
    && typeof (error as { status?: unknown }).status === 'number'
    && (error as { status?: unknown }).status === 400
    && (error as { type?: unknown }).type === 'entity.parse.failed';
}

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Không tìm thấy tài nguyên.',
    },
  });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (isInvalidJsonError(error)) {
    response.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Nội dung JSON không hợp lệ.',
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên chưa hợp lệ.',
        details: error.issues,
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Đã xảy ra lỗi phía máy chủ.',
    },
  });
};
