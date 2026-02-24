import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsCategoriesService } from './products-categories.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductsCategoriesService', () => {
  let service: ProductsCategoriesService;
  let prisma: PrismaService;

  const mockPrisma = {
    productsCategories: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    stores: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsCategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsCategoriesService>(ProductsCategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una categoría de producto exitosamente', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.productsCategories.findFirst.mockResolvedValue(null);
      mockPrisma.productsCategories.create.mockResolvedValue({
        id: 1,
        name: 'Hamburguesas',
        storeId: 1,
      });

      const result = await service.create({ name: 'Hamburguesas', storeId: 1 });

      expect(result).toEqual({ id: 1, name: 'Hamburguesas', storeId: 1 });
    });

    it('debería lanzar error si la tienda no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Hamburguesas', storeId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si la categoría ya existe en la tienda', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.productsCategories.findFirst.mockResolvedValue({
        id: 1,
        name: 'Hamburguesas',
        storeId: 1,
      });

      await expect(
        service.create({ name: 'Hamburguesas', storeId: 1 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debería obtener todas las categorías de productos', async () => {
      const mockCategories = [
        { id: 1, name: 'Hamburguesas', storeId: 1 },
        { id: 2, name: 'Pizzas', storeId: 1 },
      ];
      mockPrisma.productsCategories.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
    });
  });

  describe('findByStore', () => {
    it('debería obtener categorías por ID de tienda', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({ id: 1 });
      const mockCategories = [{ id: 1, name: 'Hamburguesas', storeId: 1 }];
      mockPrisma.productsCategories.findMany.mockResolvedValue(mockCategories);

      const result = await service.findByStore(1);

      expect(result).toEqual(mockCategories);
    });

    it('debería lanzar error si la tienda no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(service.findByStore(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('debería obtener una categoría de producto por ID', async () => {
      const mockCategory = { id: 1, name: 'Hamburguesas', storeId: 1 };
      mockPrisma.productsCategories.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCategory);
    });

    it('debería lanzar error si no encuentra la categoría', async () => {
      mockPrisma.productsCategories.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar una categoría de producto exitosamente', async () => {
      mockPrisma.productsCategories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Hamburguesas',
        storeId: 1,
      });
      mockPrisma.stores.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.productsCategories.findFirst.mockResolvedValue(null);
      mockPrisma.productsCategories.update.mockResolvedValue({
        id: 1,
        name: 'Hamburguesas Gourmet',
        storeId: 1,
      });

      const result = await service.update(1, { name: 'Hamburguesas Gourmet' });

      expect(result).toEqual({
        id: 1,
        name: 'Hamburguesas Gourmet',
        storeId: 1,
      });
    });

    it('debería lanzar error si la categoría no existe', async () => {
      mockPrisma.productsCategories.findUnique.mockResolvedValue(null);

      await expect(
        service.update(999, { name: 'Nuevo Nombre' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si el nombre ya existe en la tienda', async () => {
      mockPrisma.productsCategories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Hamburguesas',
        storeId: 1,
      });
      mockPrisma.productsCategories.findFirst.mockResolvedValue({
        id: 2,
        name: 'Pizzas',
        storeId: 1,
      });

      await expect(service.update(1, { name: 'Pizzas' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar una categoría de producto exitosamente', async () => {
      mockPrisma.productsCategories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Hamburguesas',
        storeId: 1,
      });
      mockPrisma.productsCategories.delete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(result).toEqual({
        message: 'Categoría de producto eliminada correctamente',
      });
    });

    it('debería lanzar error si la categoría no existe', async () => {
      mockPrisma.productsCategories.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
