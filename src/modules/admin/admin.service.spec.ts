/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest
    .fn()
    .mockImplementation((plain: string) =>
      Promise.resolve(plain === 'Admin123!'),
    ),
}));

describe('AdminService', () => {
  let service: AdminService;
  let jwtService: JwtService;

  const mockPrisma = {
    userAdmin: {
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    stores: { count: jest.fn() },
    product: { count: jest.fn() },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const createAdminDto = {
      username: 'admin',
      email: 'admin@test.com',
      password: 'Admin123!',
    };

    it('debería registrar un admin exitosamente', async () => {
      mockPrisma.userAdmin.count.mockResolvedValue(0);
      mockPrisma.userAdmin.findUnique.mockResolvedValue(null);
      mockPrisma.userAdmin.create.mockResolvedValue({
        id: 1,
        ...createAdminDto,
      });

      const result = await service.register(
        createAdminDto.username,
        createAdminDto.email,
        createAdminDto.password,
      );

      expect(result).toEqual({ message: 'OK' });
      expect(mockPrisma.userAdmin.create).toHaveBeenCalled();
    });

    it('debería lanzar error si ya existe un admin', async () => {
      mockPrisma.userAdmin.count.mockResolvedValue(1);

      await expect(
        service.register(
          createAdminDto.username,
          createAdminDto.email,
          createAdminDto.password,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('debería lanzar error si el username ya está en uso', async () => {
      mockPrisma.userAdmin.count.mockResolvedValue(0);
      mockPrisma.userAdmin.findUnique.mockResolvedValue({
        id: 1,
        username: 'admin',
      });

      await expect(
        service.register(
          createAdminDto.username,
          createAdminDto.email,
          createAdminDto.password,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('debería iniciar sesión exitosamente', async () => {
      const admin = {
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        password: 'hashedPassword',
        role: 'ADMIN',
      };
      mockPrisma.userAdmin.findUnique.mockResolvedValue(admin);
      mockJwtService.sign.mockReturnValue('token123');

      const result = await service.login('admin', 'Admin123!');

      expect(result).toHaveProperty('token');
      expect(result.admin).toEqual({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      });
    });

    it('debería lanzar error con credenciales inválidas', async () => {
      mockPrisma.userAdmin.findUnique.mockResolvedValue(null);

      await expect(service.login('admin', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar error si la contraseña es incorrecta', async () => {
      const admin = {
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        password: 'hashedPassword',
      };
      mockPrisma.userAdmin.findUnique.mockResolvedValue(admin);

      await expect(service.login('admin', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getDashboard', () => {
    it('debería obtener las estadísticas del dashboard', async () => {
      mockPrisma.stores.count.mockResolvedValue(5);
      mockPrisma.product.count.mockResolvedValue(10);

      const result = await service.getDashboard();

      expect(result).toEqual({ storesCount: 5, productsCount: 10 });
    });
  });
});
