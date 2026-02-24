import { Test, TestingModule } from '@nestjs/testing';
import { StoresCategoriesController } from './stores-categories.controller';
import { StoresCategoriesService } from './stores-categories.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

describe('StoresCategoriesController', () => {
  let controller: StoresCategoriesController;
  let service: StoresCategoriesService;

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
      controllers: [StoresCategoriesController],
      providers: [
        {
          provide: StoresCategoriesService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<StoresCategoriesController>(
      StoresCategoriesController,
    );
    service = module.get<StoresCategoriesService>(StoresCategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una categoría', async () => {
      const dto = { name: 'Restaurantes' };
      const mockCategory = { id: 1, name: 'Restaurantes' };
      mockService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto.name);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('debería obtener todas las categorías', async () => {
      const mockCategories = [
        { id: 1, name: 'Restaurantes' },
        { id: 2, name: 'Tiendas' },
      ];
      mockService.findAll.mockResolvedValue(mockCategories);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('debería obtener una categoría por ID', async () => {
      const mockCategory = { id: 1, name: 'Restaurantes' };
      mockService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('debería actualizar una categoría', async () => {
      const dto = { name: 'Restaurantes Actualizado' };
      const mockCategory = { id: 1, name: 'Restaurantes Actualizado' };
      mockService.update.mockResolvedValue(mockCategory);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto.name);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('remove', () => {
    it('debería eliminar una categoría', async () => {
      const mockResponse = { message: 'Categoría eliminada correctamente' };
      mockService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
    });
  });
});
