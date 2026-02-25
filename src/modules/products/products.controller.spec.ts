import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByStore: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un producto', async () => {
      const dto = {
        title: 'Mi Producto',
        price: 10.99,
        images: [
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        ],
        description: 'Descripción del producto',
        storeId: 1,
        categoryId: 1,
      };
      const mockProduct = {
        id: 1,
        title: 'Mi Producto',
        price: 10.99,
        images: ['https://cloudinary.com/image.jpg'],
        description: 'Descripción del producto',
        storeId: 1,
        categoryId: 1,
      };
      mockService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('debería obtener todos los productos', async () => {
      const mockProducts = [
        { id: 1, title: 'Producto 1' },
        { id: 2, title: 'Producto 2' },
      ];
      mockService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockProducts);
    });

    it('debería obtener todos los productos filtrados por storeId', async () => {
      const mockProducts = [{ id: 1, title: 'Producto 1', storeId: 1 }];
      mockService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll('1');

      expect(service.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findByStore', () => {
    it('debería obtener productos por storeId', async () => {
      const mockProducts = [{ id: 1, title: 'Producto 1', storeId: 1 }];
      mockService.findByStore.mockResolvedValue(mockProducts);

      const result = await controller.findByStore(1);

      expect(service.findByStore).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('debería obtener un producto por ID', async () => {
      const mockProduct = { id: 1, title: 'Mi Producto' };
      mockService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('debería actualizar un producto', async () => {
      const dto = {
        title: 'Producto Actualizado',
        price: 15.99,
      };
      const mockProduct = {
        id: 1,
        title: 'Producto Actualizado',
        price: 15.99,
      };
      mockService.update.mockResolvedValue(mockProduct);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('debería eliminar un producto', async () => {
      const mockResponse = { message: 'Producto eliminado correctamente' };
      mockService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
    });
  });
});
