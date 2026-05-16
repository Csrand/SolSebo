import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();
      response.status(status).json(errorResponse);
      return;
    }

    if (exception instanceof QueryFailedError) {
      this.handleDatabaseError(exception, response);
      return;
    }

    if (exception instanceof Error) {
      this.logger.error('Unhandled error:', exception.stack);

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno do servidor',
        error: 'Internal Server Error',
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
      error: 'Internal Server Error',
    });
  }

  private handleDatabaseError(
    exception: QueryFailedError,
    response: Response,
  ) {
    const driverError = exception.driverError as unknown as Record<string, unknown> | undefined;
    const code = driverError?.['code'] as string | undefined;

    this.logger.error('Database error:', exception.message);

    if (code === 'ER_ROW_IS_REFERENCED_2' || code === 'ER_NO_REFERENCED_ROW_2') {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Registro possui dependências vinculadas',
        error: 'Conflict',
      });
      return;
    }

    if (code === 'ER_DUP_ENTRY' || code === 'SQLITE_CONSTRAINT_UNIQUE') {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Registro duplicado',
        error: 'Conflict',
      });
      return;
    }

    if (code === 'ER_NO_REFERENCED_ROW_2') {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Referência inválida - o registro relacionado não existe',
        error: 'Bad Request',
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
      error: 'Internal Server Error',
    });
  }
}
