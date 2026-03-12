import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';

function generateSlug(name: string): string {
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  const slugFromName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .substring(0, 6);
  return `${slugFromName}${randomChars}`;
}

@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = generateSlug(name);
    let existing = await this.prisma.stores.findUnique({ where: { slug } });
    
    while (existing) {
      slug = generateSlug(name);
      existing = await this.prisma.stores.findUnique({ where: { slug } });
    }
    
    return slug;
  }

  async create(data: {
    name: string;
    image: string;
    coverImage: string;
    categoryId: number;
  }) {
    const existingCategory = await this.prisma.storesCategories.findUnique({
      where: { id: data.categoryId },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría de tienda no encontrada');
    }

    const imageResult = await this.cloudinaryService.uploadImage(
      data.image,
      'jf3/stores',
    );

    const coverImageResult = await this.cloudinaryService.uploadImage(
      data.coverImage,
      'jf3/stores/cover',
    );

    const slug = await this.generateUniqueSlug(data.name);

    const store = await this.prisma.stores.create({
      data: {
        name: data.name,
        slug,
        image: imageResult.secure_url,
        coverImage: coverImageResult.secure_url,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });

    return store;
  }

  async findAll(page: number = 1, limit: number = 20, categoryId?: number) {
    const skip = (page - 1) * limit;
    const where = categoryId ? { categoryId } : {};

    const [stores, total] = await Promise.all([
      this.prisma.stores.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.stores.count({ where }),
    ]);

    const storesWithSlug = await Promise.all(
      stores.map(async (store) => {
        if (!store.slug) {
          const newSlug = await this.generateUniqueSlug(store.name);
          return this.prisma.stores.update({
            where: { id: store.id },
            data: { slug: newSlug },
            include: { category: true },
          });
        }
        return store;
      })
    );

    return {
      data: storesWithSlug,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const store = await this.prisma.stores.findUnique({
      where: { id },
      include: {
        category: true,
        products: true,
        deliveryOptions: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    return store;
  }

  async findOneBySlug(slug: string) {
    const store = await this.prisma.stores.findUnique({
      where: { slug },
      include: {
        category: true,
        products: true,
        deliveryOptions: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    return store;
  }

  async update(
    id: number,
    data: {
      name?: string;
      image?: string;
      coverImage?: string;
      categoryId?: number;
    },
  ) {
    const existingStore = await this.prisma.stores.findUnique({
      where: { id },
    });

    if (!existingStore) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (data.categoryId) {
      const category = await this.prisma.storesCategories.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoría de tienda no encontrada');
      }
    }

    let imageUrl = existingStore.image;
    if (data.image) {
      const publicId = this.cloudinaryService.extractPublicId(
        existingStore.image,
      );
      await this.cloudinaryService.deleteImage(publicId);

      const imageResult = await this.cloudinaryService.uploadImage(
        data.image,
        'jf3/stores',
      );
      imageUrl = imageResult.secure_url;
    }

    let coverImageUrl = existingStore.coverImage;
    if (data.coverImage) {
      if (existingStore.coverImage) {
        const publicId = this.cloudinaryService.extractPublicId(
          existingStore.coverImage,
        );
        await this.cloudinaryService.deleteImage(publicId);
      }

      const coverImageResult = await this.cloudinaryService.uploadImage(
        data.coverImage,
        'jf3/stores/cover',
      );
      coverImageUrl = coverImageResult.secure_url;
    }

    return this.prisma.stores.update({
      where: { id },
      data: {
        name: data.name,
        image: imageUrl,
        coverImage: coverImageUrl,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: number) {
    const existingStore = await this.prisma.stores.findUnique({
      where: { id },
    });

    if (!existingStore) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const imagePublicId = this.cloudinaryService.extractPublicId(
      existingStore.image,
    );
    await this.cloudinaryService.deleteImage(imagePublicId);

    if (existingStore.coverImage) {
      const coverImagePublicId = this.cloudinaryService.extractPublicId(
        existingStore.coverImage,
      );
      await this.cloudinaryService.deleteImage(coverImagePublicId);
    }

    await this.prisma.stores.delete({
      where: { id },
    });

    return { message: 'Tienda eliminada correctamente' };
  }
}
