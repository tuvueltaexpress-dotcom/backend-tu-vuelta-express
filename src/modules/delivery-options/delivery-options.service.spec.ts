import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeliveryOptionsService } from './delivery-options.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DeliveryOptionsService', () => {
  let service: DeliveryOptionsService;
  let prisma: PrismaService;

  const mockPrisma = {
    deliveryOptions: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    stores: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryOptionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DeliveryOptionsService>(DeliveryOptionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una opción de delivery exitosamente', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.deliveryOptions.findFirst.mockResolvedValue(null);
      mockPrisma.deliveryOptions.create.mockResolvedValue({
        id: 1,
        name: 'Delivery Normal',
        fee: 5.0,
        storeId: 1,
      });

      const result = await service.create({
        name: 'Delivery Normal',
        fee: 5.0,
        storeId: 1,
      });

      expect(result).toEqual({
        id: 1,
        name: 'Delivery Normal',
        fee: 5.0,
        storeId: 1,
      });
    });

    it('debería lanzar error si la tienda no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Delivery Normal', fee: 5.0, storeId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si la opción ya existe en la tienda', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.deliveryOptions.findFirst.mockResolvedValue({
        id: 1,
        name: 'Delivery Normal',
        fee: 5.0,
        storeId: 1,
      });

      await expect(
        service.create({ name: 'Delivery Normal', fee: 5.0, storeId: 1 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debería obtener todas las opciones de delivery', async () => {
      const mockOptions = [
        { id: 1, name: 'Delivery Normal', fee: 5.0, storeId: 1 },
        { id: 2, name: 'Delivery Express', fee: 10.0, storeId: 1 },
      ];
      mockPrisma.deliveryOptions.findMany.mockResolvedValue(mockOptions);
      mockPrisma.deliveryOptions.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result.data).toEqual(mockOptions);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('findByStore', () => {
    it('debería obtener opciones de delivery por ID de tienda', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({ id: 1 });
      const mockOptions = [
        { id: 1, name: 'Delivery Normal', fee: 5.0, storeId: 1 },
      ];
      mockPrisma.deliveryOptions.findMany.mockResolvedValue(mockOptions);
      mockPrisma.deliveryOptions.count.mockResolvedValue(1);

      const result = await service.findByStore(1);

      expect(result.data).toEqual(mockOptions);
      expect(result.pagination.total).toBe(1);
    });

    it('debería lanzar error si la tienda no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(service.findByStore(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('debería obtener una opción de delivery por ID', async () => {
      const mockOption = {
        id: 1,
        name: 'Delivery Normal',
        fee: 5.0,
        storeId: 1,
      };
      mockPrisma.deliveryOptions.findUnique.mockResolvedValue(mockOption);

      const result = await service.findOne(1);

      expect(result).toEqual(mockOption);
    });

    it('debería lanzar error si no encuentra la opción', async () => {
      mockPrisma.deliveryOptions.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar una opción de delivery exitosamente', async () => {
      mockPrisma.deliveryOptions.findUnique.mockResolvedValue({
        id: 1,
        name: 'Delivery Normal',
        fee: 5.0,
        storeId: 1,
      });
      mockPrisma.stores.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.deliveryOptions.findFirst.mockResolvedValue(null);
      mockPrisma.deliveryOptions.update.mockResolvedValue({
        id: 1,
        name: 'Delivery Express',
        fee: 10.0,
        storeId: 1,
      });

      const result = await service.update(1, {
        name: 'Delivery Express',
        fee: 10.0,
      });

      expect(result).toEqual({
        id: 1,
        name: 'Delivery Express',
        fee: 10.0,
        storeId: 1,
      });
    });

    it('debería lanzar error si la opción no existe', async () => {
      mockPrisma.deliveryOptions.findUnique.mockResolvedValue(null);

      await expect(
        service.update(999, { name: 'Nuevo Nombre', fee: 5.0 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si el nombre ya existe en la tienda', async () => {
      mockPrisma.deliveryOptions.findUnique.mockResolvedValue({
        id: 1,
        name: 'Delivery Normal',
        fee: 5.0,
        storeId: 1,
      });
      mockPrisma.deliveryOptions.findFirst.mockResolvedValue({
        id: 2,
        name: 'Delivery Express',
        fee: 10.0,
        storeId: 1,
      });

      await expect(
        service.update(1, { name: 'Delivery Express', fee: 10.0 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('debería eliminar una opción de delivery exitosamente', async () => {
      mockPrisma.deliveryOptions.findUnique.mockResolvedValue({
        id: 1,
        name: 'Delivery Normal',
        fee: 5.0,
        storeId: 1,
      });
      mockPrisma.deliveryOptions.delete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(result).toEqual({
        message: 'Opción de delivery eliminada correctamente',
      });
    });

    it('debería lanzar error si la opción no existe', async () => {
      mockPrisma.deliveryOptions.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
