import { Test, TestingModule } from '@nestjs/testing';
import { PartnersService } from './partners.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('PartnersService', () => {
  let service: PartnersService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    storesCategories: {
      findUnique: jest.fn(),
    },
    stores: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest
      .fn()
      .mockResolvedValue({ secure_url: 'https://cloudinary.com/image.jpg' }),
    extractPublicId: jest.fn(),
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<PartnersService>(PartnersService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@partner.com',
      password: 'Password1',
      businessName: 'Test Store',
      phone: '+1234567890',
    };

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@partner.com',
      });

      await expect(
        service.register(
          registerDto.email,
          registerDto.password,
          registerDto.businessName,
          registerDto.phone,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new partner with PENDING_APPROVAL status', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        status: 'PENDING_APPROVAL',
        storePartner: { businessName: registerDto.businessName },
      });

      const result = await service.register(
        registerDto.email,
        registerDto.password,
        registerDto.businessName,
        registerDto.phone,
      );

      expect(result.message).toBe(
        'Registro exitoso. Tu cuenta está pendiente de aprobación.',
      );
      expect(result.user.status).toBe('PENDING_APPROVAL');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@partner.com',
      password: 'Password1',
    };

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login(loginDto.email, loginDto.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if status is PENDING_APPROVAL', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: loginDto.email,
        password: 'hashedpassword',
        role: 'PARTNER',
        status: 'PENDING_APPROVAL',
      });

      await expect(
        service.login(loginDto.email, loginDto.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and partner data on success', async () => {
      const mockUser = {
        id: 1,
        email: loginDto.email,
        password: 'hashedpassword',
        role: 'PARTNER',
        status: 'ACTIVE',
        storePartner: { businessName: 'Test Store', phone: '+1234567890' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.login(loginDto.email, loginDto.password);

      expect(result.token).toBe('mock-token');
      expect(result.partner.status).toBe('ACTIVE');
    });
  });
});
