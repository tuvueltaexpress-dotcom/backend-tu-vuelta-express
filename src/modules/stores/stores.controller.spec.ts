import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

describe('StoresController', () => {
  let controller: StoresController;
  let service: StoresService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: StoresService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<StoresController>(StoresController);
    service = module.get<StoresService>(StoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una tienda', async () => {
      const dto = {
        name: 'Mi Tienda',
        image:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        coverImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        categoryId: 1,
      };
      const mockStore = {
        id: 1,
        name: 'Mi Tienda',
        image: 'https://cloudinary.com/image.jpg',
        coverImage: 'https://cloudinary.com/cover.jpg',
        categoryId: 1,
      };
      mockService.create.mockResolvedValue(mockStore);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockStore);
    });
  });

  describe('findAll', () => {
    it('debería obtener todas las tiendas', async () => {
      const mockStores = [
        { id: 1, name: 'Tienda 1' },
        { id: 2, name: 'Tienda 2' },
      ];
      mockService.findAll.mockResolvedValue(mockStores);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockStores);
    });
  });

  describe('findOne', () => {
    it('debería obtener una tienda por ID', async () => {
      const mockStore = { id: 1, name: 'Mi Tienda' };
      mockService.findOne.mockResolvedValue(mockStore);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStore);
    });
  });

  describe('update', () => {
    it('debería actualizar una tienda', async () => {
      const dto = {
        name: 'Tienda Actualizada',
        image:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        coverImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        categoryId: 1,
      };
      const mockStore = { id: 1, name: 'Tienda Actualizada' };
      mockService.update.mockResolvedValue(mockStore);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockStore);
    });
  });

  describe('remove', () => {
    it('debería eliminar una tienda', async () => {
      const mockResponse = { message: 'Tienda eliminada correctamente' };
      mockService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
    });
  });
});
