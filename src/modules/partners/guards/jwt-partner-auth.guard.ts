import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtPartnerAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException(
        'No se proporcionó token de autenticación',
      );
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      const payload = this.jwtService.verify(token);

      if (payload.role !== 'PARTNER') {
        throw new ForbiddenException('No tienes permisos de partner');
      }

      if (payload.status && payload.status !== 'ACTIVE') {
        throw new ForbiddenException('Tu cuenta no está activa');
      }

      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
