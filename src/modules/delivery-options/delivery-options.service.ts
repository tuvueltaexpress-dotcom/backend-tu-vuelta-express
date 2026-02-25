import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeliveryOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; fee: number; storeId: number }) {
    const existingStore = await this.prisma.stores.findUnique({
      where: { id: data.storeId },
    });

    if (!existingStore) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const existingOption = await this.prisma.deliveryOptions.findFirst({
      where: { name: data.name, storeId: data.storeId },
    });

    if (existingOption) {
      throw new ConflictException(
        'Ya existe una opción de delivery con este nombre en esta tienda',
      );
    }

    const option = await this.prisma.deliveryOptions.create({
      data: {
        name: data.name,
        fee: data.fee,
        storeId: data.storeId,
      },
      include: {
        store: true,
      },
    });

    return option;
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [options, total] = await Promise.all([
      this.prisma.deliveryOptions.findMany({
        include: {
          store: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.deliveryOptions.count(),
    ]);

    return {
      data: options,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByStore(storeId: number, page: number = 1, limit: number = 20) {
    const store = await this.prisma.stores.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const skip = (page - 1) * limit;

    const [options, total] = await Promise.all([
      this.prisma.deliveryOptions.findMany({
        where: { storeId },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.deliveryOptions.count({ where: { storeId } }),
    ]);

    return {
      data: options,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const option = await this.prisma.deliveryOptions.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!option) {
      throw new NotFoundException('Opción de delivery no encontrada');
    }

    return option;
  }

  async update(
    id: number,
    data: { name?: number | string; fee?: number; storeId?: number },
  ) {
    const existingOption = await this.prisma.deliveryOptions.findUnique({
      where: { id },
    });

    if (!existingOption) {
      throw new NotFoundException('Opción de delivery no encontrada');
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
      const optionWithName = await this.prisma.deliveryOptions.findFirst({
        where: {
          name: data.name as string,
          storeId: data.storeId || existingOption.storeId,
          NOT: { id },
        },
      });

      if (optionWithName) {
        throw new ConflictException(
          'Ya existe una opción de delivery con este nombre en esta tienda',
        );
      }
    }

    return this.prisma.deliveryOptions.update({
      where: { id },
      data: {
        name: data.name as string,
        fee: data.fee,
        storeId: data.storeId,
      },
      include: {
        store: true,
      },
    });
  }

  async remove(id: number) {
    const existingOption = await this.prisma.deliveryOptions.findUnique({
      where: { id },
    });

    if (!existingOption) {
      throw new NotFoundException('Opción de delivery no encontrada');
    }

    await this.prisma.deliveryOptions.delete({
      where: { id },
    });

    return { message: 'Opción de delivery eliminada correctamente' };
  }
}
