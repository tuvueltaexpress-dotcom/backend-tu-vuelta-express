import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StoresService } from './stores.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';

describe('StoresService', () => {
  let service: StoresService;
  let cloudinaryService: CloudinaryService;

  const mockPrisma = {
    stores: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    storesCategories: {
      findUnique: jest.fn(),
    },
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
    extractPublicId: jest.fn((url) => 'jf3/stores/image_123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una tienda exitosamente', async () => {
      mockPrisma.storesCategories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Restaurantes',
      });
      mockCloudinaryService.uploadImage
        .mockResolvedValueOnce({
          secure_url: 'https://cloudinary.com/image.jpg',
          public_id: 'jf3/stores/image_123',
        })
        .mockResolvedValueOnce({
          secure_url: 'https://cloudinary.com/cover.jpg',
          public_id: 'jf3/stores/cover/cover_123',
        });
      mockPrisma.stores.create.mockResolvedValue({
        id: 1,
        name: 'Mi Tienda',
        image: 'https://cloudinary.com/image.jpg',
        coverImage: 'https://cloudinary.com/cover.jpg',
        categoryId: 1,
        category: { id: 1, name: 'Restaurantes' },
      });

      const result = await service.create({
        name: 'Mi Tienda',
        image:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        coverImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        categoryId: 1,
      });

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Mi Tienda');
      expect(result.image).toBe('https://cloudinary.com/image.jpg');
      expect(result.coverImage).toBe('https://cloudinary.com/cover.jpg');
    });

    it('debería lanzar error si la categoría no existe', async () => {
      mockPrisma.storesCategories.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Mi Tienda',
          image:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          coverImage:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          categoryId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('debería obtener todas las tiendas', async () => {
      const mockStores = [
        { id: 1, name: 'Tienda 1', category: { id: 1, name: 'Restaurantes' } },
        { id: 2, name: 'Tienda 2', category: { id: 1, name: 'Restaurantes' } },
      ];
      mockPrisma.stores.findMany.mockResolvedValue(mockStores);
      mockPrisma.stores.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result.data).toEqual(mockStores);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('debería obtener una tienda por ID', async () => {
      const mockStore = {
        id: 1,
        name: 'Mi Tienda',
        category: { id: 1, name: 'Restaurantes' },
        products: [],
        deliveryOptions: [],
      };
      mockPrisma.stores.findUnique.mockResolvedValue(mockStore);

      const result = await service.findOne(1);

      expect(result).toEqual(mockStore);
    });

    it('debería lanzar error si no encuentra la tienda', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar una tienda exitosamente', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({
        id: 1,
        name: 'Tienda Vieja',
        image: 'https://cloudinary.com/old.jpg',
        coverImage: 'https://cloudinary.com/cover_old.jpg',
        categoryId: 1,
      });
      mockPrisma.storesCategories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Restaurantes',
      });
      mockPrisma.stores.update.mockResolvedValue({
        id: 1,
        name: 'Tienda Nueva',
        image: 'https://cloudinary.com/old.jpg',
        coverImage: 'https://cloudinary.com/cover_old.jpg',
        categoryId: 1,
        category: { id: 1, name: 'Restaurantes' },
      });

      const result = await service.update(1, { name: 'Tienda Nueva' });

      expect(result.name).toBe('Tienda Nueva');
    });

    it('debería lanzar error si la tienda no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Nuevo' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar error si la categoría no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({
        id: 1,
        name: 'Tienda',
        image: 'https://cloudinary.com/image.jpg',
        coverImage: 'https://cloudinary.com/cover.jpg',
        categoryId: 1,
      });
      mockPrisma.storesCategories.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { categoryId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería actualizar imagen y eliminar la anterior', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({
        id: 1,
        name: 'Tienda',
        image: 'https://cloudinary.com/old.jpg',
        coverImage: 'https://cloudinary.com/cover.jpg',
        categoryId: 1,
      });
      mockCloudinaryService.extractPublicId.mockReturnValue('jf3/stores/old');
      mockCloudinaryService.uploadImage.mockResolvedValue({
        secure_url: 'https://cloudinary.com/new.jpg',
        public_id: 'jf3/stores/new',
      });
      mockPrisma.stores.update.mockResolvedValue({
        id: 1,
        name: 'Tienda',
        image: 'https://cloudinary.com/new.jpg',
        coverImage: 'https://cloudinary.com/cover.jpg',
        categoryId: 1,
        category: { id: 1, name: 'Restaurantes' },
      });

      const result = await service.update(1, {
        image: 'data:image/png;base64,newimage',
      });

      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(
        'jf3/stores/old',
      );
      expect(result.image).toBe('https://cloudinary.com/new.jpg');
    });
  });

  describe('remove', () => {
    it('debería eliminar una tienda y sus imágenes en Cloudinary', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({
        id: 1,
        name: 'Mi Tienda',
        image: 'https://cloudinary.com/image.jpg',
        coverImage: 'https://cloudinary.com/cover.jpg',
        categoryId: 1,
      });
      mockCloudinaryService.extractPublicId
        .mockReturnValueOnce('jf3/stores/image_123')
        .mockReturnValueOnce('jf3/stores/cover/cover_123');
      mockPrisma.stores.delete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: 'Tienda eliminada correctamente' });
    });

    it('debería lanzar error si la tienda no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
