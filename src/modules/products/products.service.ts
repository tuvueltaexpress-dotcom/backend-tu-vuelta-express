import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';

function generateSlug(title: string): string {
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  const slugFromTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .substring(0, 6);
  return `${slugFromTitle}${randomChars}`;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = generateSlug(title);
    let existing = await this.prisma.product.findUnique({ where: { slug } });
    
    while (existing) {
      slug = generateSlug(title);
      existing = await this.prisma.product.findUnique({ where: { slug } });
    }
    
    return slug;
  }

  async create(data: {
    title: string;
    price: number;
    images: string[];
    description: string;
    storeId: number;
    categoryId: number;
  }) {
    const existingStore = await this.prisma.stores.findUnique({
      where: { id: data.storeId },
    });

    if (!existingStore) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const existingCategory = await this.prisma.productsCategories.findUnique({
      where: { id: data.categoryId },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría de producto no encontrada');
    }

    const imageUploadPromises = data.images.map((image) =>
      this.cloudinaryService.uploadImage(image, `jf3/products/${data.storeId}`),
    );
    const imageResults = await Promise.all(imageUploadPromises);
    const imageUrls = imageResults.map((result) => result.secure_url);

    const slug = await this.generateUniqueSlug(data.title);

    const product = await this.prisma.product.create({
      data: {
        title: data.title,
        slug,
        price: data.price,
        images: imageUrls,
        description: data.description,
        storeId: data.storeId,
        categoryId: data.categoryId,
      },
      include: {
        store: true,
        category: true,
      },
    });

    return product;
  }

  async findAll(storeId?: number, page: number = 1, limit: number = 20) {
    const where = storeId ? { storeId } : {};
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          store: true,
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const productsWithSlug = await Promise.all(
      products.map(async (product) => {
        if (!product.slug) {
          const newSlug = await this.generateUniqueSlug(product.title);
          return this.prisma.product.update({
            where: { id: product.id },
            data: { slug: newSlug },
            include: { store: true, category: true },
          });
        }
        return product;
      })
    );

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async findOneBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        store: true,
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async findByStore(storeId: number, page: number = 1, limit: number = 20) {
    const existingStore = await this.prisma.stores.findUnique({
      where: { id: storeId },
    });

    if (!existingStore) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { storeId },
        include: {
          store: true,
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where: { storeId } }),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    id: number,
    data: {
      title?: string;
      price?: number;
      images?: string[];
      description?: string;
      storeId?: number;
      categoryId?: number;
    },
  ) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (data.storeId) {
      const store = await this.prisma.stores.findUnique({
        where: { id: data.storeId },
      });

      if (!store) {
        throw new NotFoundException('Tienda no encontrada');
      }
    }

    if (data.categoryId) {
      const category = await this.prisma.productsCategories.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoría de producto no encontrada');
      }
    }

    let imageUrls = existingProduct.images;
    if (data.images && data.images.length > 0) {
      const deletePromises = existingProduct.images.map((image) => {
        const publicId = this.cloudinaryService.extractPublicId(image);
        return this.cloudinaryService.deleteImage(publicId);
      });
      await Promise.all(deletePromises);

      const uploadPromises = data.images.map((image) =>
        this.cloudinaryService.uploadImage(
          image,
          `jf3/products/${data.storeId || existingProduct.storeId}`,
        ),
      );
      const imageResults = await Promise.all(uploadPromises);
      imageUrls = imageResults.map((result) => result.secure_url);
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        price: data.price,
        images: imageUrls,
        description: data.description,
        storeId: data.storeId,
        categoryId: data.categoryId,
      },
      include: {
        store: true,
        category: true,
      },
    });
  }

  async remove(id: number) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    const deletePromises = existingProduct.images.map((image) => {
      const publicId = this.cloudinaryService.extractPublicId(image);
      return this.cloudinaryService.deleteImage(publicId);
    });
    await Promise.all(deletePromises);

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Producto eliminado correctamente' };
  }
}
