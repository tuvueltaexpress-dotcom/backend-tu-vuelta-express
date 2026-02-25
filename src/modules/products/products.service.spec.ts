import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrisma = {
    product: {
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
    productsCategories: {
      findUnique: jest.fn(),
    },
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
    extractPublicId: jest.fn((_url) => 'jf3/products/image_123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un producto exitosamente', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({
        id: 1,
        name: 'Mi Tienda',
      });
      mockPrisma.productsCategories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Bebidas',
      });
      mockCloudinaryService.uploadImage
        .mockResolvedValueOnce({
          secure_url: 'https://cloudinary.com/image1.jpg',
          public_id: 'jf3/products/1/image1_123',
        })
        .mockResolvedValueOnce({
          secure_url: 'https://cloudinary.com/image2.jpg',
          public_id: 'jf3/products/1/image2_123',
        });
      mockPrisma.product.create.mockResolvedValue({
        id: 1,
        title: 'Mi Producto',
        price: 10.99,
        images: [
          'https://cloudinary.com/image1.jpg',
          'https://cloudinary.com/image2.jpg',
        ],
        description: 'Descripción del producto',
        storeId: 1,
        categoryId: 1,
        store: { id: 1, name: 'Mi Tienda' },
        category: { id: 1, name: 'Bebidas' },
      });

      const result = await service.create({
        title: 'Mi Producto',
        price: 10.99,
        images: [
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        ],
        description: 'Descripción del producto',
        storeId: 1,
        categoryId: 1,
      });

      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Mi Producto');
      expect(result.price).toBe(10.99);
      expect(result.images).toHaveLength(2);
    });

    it('debería lanzar error si la tienda no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          title: 'Mi Producto',
          price: 10.99,
          images: [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          ],
          description: 'Descripción del producto',
          storeId: 999,
          categoryId: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar error si la categoría no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({
        id: 1,
        name: 'Mi Tienda',
      });
      mockPrisma.productsCategories.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          title: 'Mi Producto',
          price: 10.99,
          images: [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          ],
          description: 'Descripción del producto',
          storeId: 1,
          categoryId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('debería obtener todos los productos', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Producto 1',
          store: { id: 1, name: 'Tienda 1' },
          category: { id: 1, name: 'Bebidas' },
        },
        {
          id: 2,
          title: 'Producto 2',
          store: { id: 1, name: 'Tienda 1' },
          category: { id: 1, name: 'Bebidas' },
        },
      ];
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result.data).toEqual(mockProducts);
      expect(result.pagination.total).toBe(2);
    });

    it('debería filtrar productos por storeId', async () => {
      const mockProducts = [{ id: 1, title: 'Producto 1', storeId: 1 }];
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      await service.findAll(1);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { storeId: 1 },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('debería obtener un producto por ID', async () => {
      const mockProduct = {
        id: 1,
        title: 'Mi Producto',
        store: { id: 1, name: 'Mi Tienda' },
        category: { id: 1, name: 'Bebidas' },
      };
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
    });

    it('debería lanzar error si no encuentra el producto', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStore', () => {
    it('debería obtener productos por storeId', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue({
        id: 1,
        name: 'Mi Tienda',
      });
      const mockProducts = [{ id: 1, title: 'Producto 1', storeId: 1 }];
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.findByStore(1);

      expect(result.data).toEqual(mockProducts);
      expect(result.pagination.total).toBe(1);
    });

    it('debería lanzar error si la tienda no existe', async () => {
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(service.findByStore(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar un producto exitosamente', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 1,
        title: 'Producto Viejo',
        price: 10.0,
        images: ['https://cloudinary.com/old.jpg'],
        description: 'Descripción vieja',
        storeId: 1,
        categoryId: 1,
      });
      mockPrisma.product.update.mockResolvedValue({
        id: 1,
        title: 'Producto Nuevo',
        price: 15.0,
        images: ['https://cloudinary.com/old.jpg'],
        description: 'Descripción vieja',
        storeId: 1,
        categoryId: 1,
        store: { id: 1, name: 'Mi Tienda' },
        category: { id: 1, name: 'Bebidas' },
      });

      const result = await service.update(1, {
        title: 'Producto Nuevo',
        price: 15.0,
      });

      expect(result.title).toBe('Producto Nuevo');
      expect(result.price).toBe(15.0);
    });

    it('debería lanzar error si el producto no existe', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { title: 'Nuevo' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar error si la tienda no existe', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 1,
        title: 'Producto',
        price: 10.0,
        images: ['https://cloudinary.com/image.jpg'],
        description: 'Descripción',
        storeId: 1,
        categoryId: 1,
      });
      mockPrisma.stores.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { storeId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar error si la categoría no existe', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 1,
        title: 'Producto',
        price: 10.0,
        images: ['https://cloudinary.com/image.jpg'],
        description: 'Descripción',
        storeId: 1,
        categoryId: 1,
      });
      mockPrisma.productsCategories.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { categoryId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería actualizar imágenes y eliminar las anteriores', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 1,
        title: 'Producto',
        price: 10.0,
        images: [
          'https://cloudinary.com/old1.jpg',
          'https://cloudinary.com/old2.jpg',
        ],
        description: 'Descripción',
        storeId: 1,
        categoryId: 1,
      });
      mockCloudinaryService.extractPublicId
        .mockReturnValueOnce('jf3/products/old1')
        .mockReturnValueOnce('jf3/products/old2');
      mockCloudinaryService.uploadImage
        .mockResolvedValueOnce({
          secure_url: 'https://cloudinary.com/new1.jpg',
          public_id: 'jf3/products/new1',
        })
        .mockResolvedValueOnce({
          secure_url: 'https://cloudinary.com/new2.jpg',
          public_id: 'jf3/products/new2',
        });
      mockPrisma.product.update.mockResolvedValue({
        id: 1,
        title: 'Producto',
        price: 10.0,
        images: [
          'https://cloudinary.com/new1.jpg',
          'https://cloudinary.com/new2.jpg',
        ],
        description: 'Descripción',
        storeId: 1,
        categoryId: 1,
        store: { id: 1, name: 'Mi Tienda' },
        category: { id: 1, name: 'Bebidas' },
      });

      const result = await service.update(1, {
        images: [
          'data:image/png;base64,newimage1',
          'data:image/png;base64,newimage2',
        ],
      });

      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledTimes(2);
      expect(result.images).toHaveLength(2);
    });
  });

  describe('remove', () => {
    it('debería eliminar un producto y sus imágenes en Cloudinary', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 1,
        title: 'Mi Producto',
        images: [
          'https://cloudinary.com/image1.jpg',
          'https://cloudinary.com/image2.jpg',
        ],
        storeId: 1,
        categoryId: 1,
      });
      mockCloudinaryService.extractPublicId
        .mockReturnValueOnce('jf3/products/image1_123')
        .mockReturnValueOnce('jf3/products/image2_123');
      mockPrisma.product.delete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: 'Producto eliminado correctamente' });
    });

    it('debería lanzar error si el producto no existe', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
