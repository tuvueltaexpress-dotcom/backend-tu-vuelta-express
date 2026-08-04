import { Test, TestingModule } from '@nestjs/testing';
import { DeliverySettingsService } from './delivery-settings.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DeliverySettingsService', () => {
  let service: DeliverySettingsService;

  const mockPrisma = {
    deliverySettings: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliverySettingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DeliverySettingsService>(DeliverySettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('debería crear la fila por defecto si no existe y devolverla', async () => {
      const mockSettings = { id: 1, pricePerKm: 0, updatedAt: new Date() };
      mockPrisma.deliverySettings.upsert.mockResolvedValue(mockSettings);

      const result = await service.get();

      expect(mockPrisma.deliverySettings.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        update: {},
        create: { id: 1 },
      });
      expect(result).toEqual(mockSettings);
    });
  });

  describe('update', () => {
    it('debería actualizar el precio por km', async () => {
      const mockSettings = { id: 1, pricePerKm: 5, updatedAt: new Date() };
      mockPrisma.deliverySettings.upsert.mockResolvedValue(mockSettings);

      const result = await service.update(5);

      expect(mockPrisma.deliverySettings.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        update: { pricePerKm: 5 },
        create: { id: 1, pricePerKm: 5 },
      });
      expect(result).toEqual(mockSettings);
    });
  });
});
