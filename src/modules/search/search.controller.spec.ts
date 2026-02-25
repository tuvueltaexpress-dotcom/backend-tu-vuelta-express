import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let service: SearchService;

  const mockService = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('debería buscar con query y sin tipo', async () => {
      const mockResults = {
        stores: [{ id: 1, name: 'Restaurante' }],
        products: [{ id: 1, title: 'Pizza' }],
      };
      mockService.search.mockResolvedValue(mockResults);

      const result = await controller.search('pizza');

      expect(service.search).toHaveBeenCalled();
      expect(result).toEqual(mockResults);
    });

    it('debería buscar con query y tipo stores', async () => {
      const mockResults = { stores: [{ id: 1, name: 'Restaurante' }] };
      mockService.search.mockResolvedValue(mockResults);

      const result = await controller.search('pizza', 'stores');

      expect(service.search).toHaveBeenCalled();
      expect(result).toEqual(mockResults);
    });

    it('debería buscar con paginación', async () => {
      const mockResults = {
        stores: [],
        products: [],
        pagination: {
          stores: { total: 50, page: 2, limit: 10, totalPages: 5 },
        },
      };
      mockService.search.mockResolvedValue(mockResults);

      const result = await controller.search('pizza', 'all', 2, 10);

      expect(service.search).toHaveBeenCalledWith('pizza', 'all', 2, 10);
      expect(result).toEqual(mockResults);
    });
  });
});
