import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; storeId: number }) {
    const existingStore = await this.prisma.stores.findUnique({
      where: { id: data.storeId },
    });

    if (!existingStore) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const existingCategory = await this.prisma.productsCategories.findFirst({
      where: { name: data.name, storeId: data.storeId },
    });

    if (existingCategory) {
      throw new ConflictException(
        'Ya existe una categoría con este nombre en esta tienda',
      );
    }

    const category = await this.prisma.productsCategories.create({
      data: {
        name: data.name,
        storeId: data.storeId,
      },
      include: {
        store: true,
      },
    });

    return category;
  }

  async findAll() {
    return this.prisma.productsCategories.findMany({
      include: {
        store: true,
        products: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByStore(storeId: number) {
    const store = await this.prisma.stores.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    return this.prisma.productsCategories.findMany({
      where: { storeId },
      include: {
        products: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.productsCategories.findUnique({
      where: { id },
      include: {
        store: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría de producto no encontrada');
    }

    return category;
  }

  async update(id: number, data: { name?: string; storeId?: number }) {
    const existingCategory = await this.prisma.productsCategories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría de producto no encontrada');
    }

    if (data.storeId) {
      const store = await this.prisma.stores.findUnique({
        where: { id: data.storeId },
      });

      if (!store) {
        throw new NotFoundException('Tienda no encontrada');
      }
    }

    if (data.name) {
      const categoryWithName = await this.prisma.productsCategories.findFirst({
        where: {
          name: data.name,
          storeId: data.storeId || existingCategory.storeId,
          NOT: { id },
        },
      });

      if (categoryWithName) {
        throw new ConflictException(
          'Ya existe una categoría con este nombre en esta tienda',
        );
      }
    }

    return this.prisma.productsCategories.update({
      where: { id },
      data: {
        name: data.name,
        storeId: data.storeId,
      },
      include: {
        store: true,
      },
    });
  }

  async remove(id: number) {
    const existingCategory = await this.prisma.productsCategories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría de producto no encontrada');
    }

    await this.prisma.productsCategories.delete({
      where: { id },
    });

    return { message: 'Categoría de producto eliminada correctamente' };
  }
}
