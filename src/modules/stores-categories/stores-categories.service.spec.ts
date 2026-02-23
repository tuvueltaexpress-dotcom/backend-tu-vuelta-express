import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StoresCategoriesService } from './stores-categories.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('StoresCategoriesService', () => {
  let service: StoresCategoriesService;
  let prisma: PrismaService;

  const mockPrisma = {
    storesCategories: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresCategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StoresCategoriesService>(StoresCategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una categoría exitosamente', async () => {
      mockPrisma.storesCategories.findFirst.mockResolvedValue(null);
      mockPrisma.storesCategories.create.mockResolvedValue({
        id: 1,
        name: 'Restaurantes',
      });

      const result = await service.create('Restaurantes');

      expect(result).toEqual({ id: 1, name: 'Restaurantes' });
    });

    it('debería lanzar error si la categoría ya existe', async () => {
      mockPrisma.storesCategories.findFirst.mockResolvedValue({
        id: 1,
        name: 'Restaurantes',
      });

      await expect(service.create('Restaurantes')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('debería obtener todas las categorías', async () => {
      const mockCategories = [
        { id: 1, name: 'Restaurantes' },
        { id: 2, name: 'Tiendas' },
      ];
      mockPrisma.storesCategories.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('debería obtener una categoría por ID', async () => {
      const mockCategory = { id: 1, name: 'Restaurantes' };
      mockPrisma.storesCategories.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCategory);
    });

    it('debería lanzar error si no encuentra la categoría', async () => {
      mockPrisma.storesCategories.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar una categoría exitosamente', async () => {
      mockPrisma.storesCategories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Restaurantes',
      });
      mockPrisma.storesCategories.findFirst.mockResolvedValue(null);
      mockPrisma.storesCategories.update.mockResolvedValue({
        id: 1,
        name: 'Restaurantes Actualizado',
      });

      const result = await service.update(1, 'Restaurantes Actualizado');

      expect(result).toEqual({ id: 1, name: 'Restaurantes Actualizado' });
    });

    it('debería lanzar error si la categoría no existe', async () => {
      mockPrisma.storesCategories.findUnique.mockResolvedValue(null);

      await expect(service.update(999, 'Nuevo Nombre')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar error si el nombre ya existe', async () => {
      mockPrisma.storesCategories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Restaurantes',
      });
      mockPrisma.storesCategories.findFirst.mockResolvedValue({
        id: 2,
        name: 'Tiendas',
      });

      await expect(service.update(1, 'Tiendas')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar una categoría exitosamente', async () => {
      mockPrisma.storesCategories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Restaurantes',
      });
      mockPrisma.storesCategories.delete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Categoría eliminada correctamente' });
    });

    it('debería lanzar error si la categoría no existe', async () => {
      mockPrisma.storesCategories.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
