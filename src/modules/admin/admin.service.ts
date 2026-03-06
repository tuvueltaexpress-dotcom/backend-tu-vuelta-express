import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
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

    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
    };

    return {
      token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async getDashboard() {
    const [storesCount, productsCount] = await Promise.all([
      this.prisma.stores.count(),
      this.prisma.product.count(),
    ]);

    return {
      storesCount,
      productsCount,
    };
  }

  async getPendingPartners() {
    const partners = await this.prisma.user.findMany({
      where: {
        role: 'PARTNER',
        status: 'PENDING_APPROVAL',
      },
      include: {
        storePartner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return partners.map((partner) => ({
      id: partner.id,
      email: partner.email,
      status: partner.status,
      createdAt: partner.createdAt,
      businessName: partner.storePartner?.businessName,
      phone: partner.storePartner?.phone,
    }));
  }

  async approvePartner(partnerId: number) {
    const partner = await this.prisma.user.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner no encontrado');
    }

    if (partner.role !== 'PARTNER') {
      throw new BadRequestException('El usuario no es un partner');
    }

    if (partner.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException(
        'El partner no está pendiente de aprobación',
      );
    }

    await this.prisma.user.update({
      where: { id: partnerId },
      data: { status: 'ACTIVE' },
    });

    return { message: 'Partner aprobado exitosamente' };
  }

  async rejectPartner(partnerId: number) {
    const partner = await this.prisma.user.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner no encontrado');
    }

    if (partner.role !== 'PARTNER') {
      throw new BadRequestException('El usuario no es un partner');
    }

    if (partner.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException(
        'El partner no está pendiente de aprobación',
      );
    }

    await this.prisma.user.update({
      where: { id: partnerId },
      data: { status: 'REJECTED' },
    });

    return { message: 'Partner rechazado' };
  }
}
