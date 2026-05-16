import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error('Database error:', exception.message);

    const driverError = exception.driverError as unknown as
      | Record<string, unknown>
      | undefined;
    const code = driverError?.['code'] as string | undefined;

    if (
      code === 'ER_ROW_IS_REFERENCED_2' ||
      code === 'ER_NO_REFERENCED_ROW_2'
    ) {
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
