import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoresCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    const existingCategory = await this.prisma.storesCategories.findFirst({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('Ya existe una categoría con este nombre');
    }

    const category = await this.prisma.storesCategories.create({
      data: { name },
    });

    return category;
  }

  async findAll() {
    return this.prisma.storesCategories.findMany({
      include: {
        stores: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.storesCategories.findUnique({
      where: { id },
      include: {
        stores: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(id: number, name: string) {
    const existingCategory = await this.prisma.storesCategories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const categoryWithName = await this.prisma.storesCategories.findFirst({
      where: { name, NOT: { id } },
    });

    if (categoryWithName) {
      throw new ConflictException('Ya existe una categoría con este nombre');
    }

    return this.prisma.storesCategories.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: number) {
    const existingCategory = await this.prisma.storesCategories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    await this.prisma.storesCategories.delete({
      where: { id },
    });

    return { message: 'Categoría eliminada correctamente' };
  }
}
