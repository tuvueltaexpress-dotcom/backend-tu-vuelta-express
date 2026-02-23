import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip || request.connection?.remoteAddress;

    this.logger.log(
      `Incoming ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - now;
          this.logger.log(
            `Outgoing ${method} ${url} - ${statusCode} - ${duration}ms`,
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `Error ${method} ${url} - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
