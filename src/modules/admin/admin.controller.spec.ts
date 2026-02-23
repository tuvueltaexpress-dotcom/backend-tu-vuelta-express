/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    register: jest.fn(),
    login: jest.fn(),
    getDashboard: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar un administrador', async () => {
      const createAdminDto = {
        username: 'admin',
        email: 'admin@test.com',
        password: 'Admin123!',
      };
      mockAdminService.register.mockResolvedValue({ message: 'OK' });

      const result = await controller.register(createAdminDto);

      expect(service.register).toHaveBeenCalledWith(
        createAdminDto.username,
        createAdminDto.email,
        createAdminDto.password,
      );
      expect(result).toEqual({ message: 'OK' });
    });
  });

  describe('login', () => {
    it('debería iniciar sesión', () => {
      const loginDto = { username: 'admin', password: 'Admin123!' };
      const mockResponse = {
        token: 'token123',
        admin: { id: 1, username: 'admin', email: 'admin@test.com' },
      };
      mockAdminService.login.mockReturnValue(mockResponse);

      const result = controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDashboard', () => {
    it('debería obtener datos del dashboard', () => {
      const mockDashboard = { storesCount: 5, productsCount: 10 };
      mockAdminService.getDashboard.mockReturnValue(mockDashboard);

      const result = controller.getDashboard();

      expect(service.getDashboard).toHaveBeenCalled();
      expect(result).toEqual(mockDashboard);
    });
  });
});
