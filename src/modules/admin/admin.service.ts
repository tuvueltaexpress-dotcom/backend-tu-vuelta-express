import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  private validateUsername(username: string): void {
    if (!this.usernameRegex.test(username)) {
      throw new BadRequestException(
        'El username debe tener entre 3 y 20 caracteres, solo letras, números y guiones bajos',
      );
    }
  }

  private validateEmail(email: string): void {
    if (!this.emailRegex.test(email)) {
      throw new BadRequestException('El email debe tener un formato válido');
    }
  }

  private validatePassword(password: string): void {
    if (!this.passwordRegex.test(password)) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
      );
    }
  }

  async register(username: string, email: string, password: string) {
    this.validateUsername(username);
    this.validateEmail(email);
    this.validatePassword(password);

    const adminCount = await this.prisma.userAdmin.count();

    if (adminCount >= 1) {
      throw new ConflictException('Ya existe un administrador en el sistema');
    }

    const existingUsername = await this.prisma.userAdmin.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictException('El username ya está en uso');
    }

    const existingEmail = await this.prisma.userAdmin.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.userAdmin.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return { message: 'OK' };
  }

  async login(username: string, password: string) {
    const admin = await this.prisma.userAdmin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: admin.id, username: admin.username };

    return {
      token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    };
  }
}
