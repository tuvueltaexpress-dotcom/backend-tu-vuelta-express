import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;

  const mockPrisma = {
    stores: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('debería buscar en tiendas y productos por defecto', async () => {
      const mockStores = [{ id: 1, name: 'Restaurante Pizza' }];
      const mockProducts = [{ id: 1, title: 'Pizza Margherita' }];

      mockPrisma.stores.findMany.mockResolvedValue(mockStores);
      mockPrisma.stores.count.mockResolvedValue(1);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.search('pizza');

      expect(result.stores).toEqual(mockStores);
      expect(result.products).toEqual(mockProducts);
      expect(result.pagination).toBeDefined();
    });

    it('debería buscar solo en tiendas cuando type=stores', async () => {
      const mockStores = [{ id: 1, name: 'Restaurante Pizza' }];
      mockPrisma.stores.findMany.mockResolvedValue(mockStores);
      mockPrisma.stores.count.mockResolvedValue(1);

      const result = await service.search('pizza', 'stores');

      expect(result.stores).toEqual(mockStores);
      expect(result.products).toBeUndefined();
    });

    it('debería buscar solo en productos cuando type=products', async () => {
      const mockProducts = [{ id: 1, title: 'Pizza Margherita' }];
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.search('pizza', 'products');

      expect(result.products).toEqual(mockProducts);
      expect(result.stores).toBeUndefined();
    });

    it('debería usar paginación', async () => {
      mockPrisma.stores.findMany.mockResolvedValue([]);
      mockPrisma.stores.count.mockResolvedValue(50);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(50);

      const result = await service.search('test', 'all', 2, 10);

      expect(mockPrisma.stores.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(result.pagination?.stores.page).toBe(2);
      expect(result.pagination?.stores.totalPages).toBe(5);
    });
  });
});
