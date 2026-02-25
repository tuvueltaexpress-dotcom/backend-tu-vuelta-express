import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    query: string,
    type?: 'stores' | 'products' | 'all',
    page: number = 1,
    limit: number = 20,
  ) {
    const searchQuery = query.toLowerCase();
    const skip = (page - 1) * limit;

    const results: {
      stores?: any[];
      products?: any[];
      pagination?: {
        stores: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
        products: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    } = {};

    if (!type || type === 'stores' || type === 'all') {
      const [stores, totalStores] = await Promise.all([
        this.prisma.stores.findMany({
          where: {
            OR: [{ name: { contains: searchQuery, mode: 'insensitive' } }],
          },
          include: {
            category: true,
          },
          skip,
          take: limit,
        }),
        this.prisma.stores.count({
          where: {
            OR: [{ name: { contains: searchQuery, mode: 'insensitive' } }],
          },
        }),
      ]);

      results.stores = stores;
      results.pagination = {
        stores: {
          total: totalStores,
          page,
          limit,
          totalPages: Math.ceil(totalStores / limit),
        },
        products: { total: 0, page: 0, limit: 0, totalPages: 0 },
      };
    }

    if (!type || type === 'products' || type === 'all') {
      const [products, totalProducts] = await Promise.all([
        this.prisma.product.findMany({
          where: {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
          include: {
            store: true,
            category: true,
          },
          skip,
          take: limit,
        }),
        this.prisma.product.count({
          where: {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
        }),
      ]);

      results.products = products;
      if (results.pagination) {
        results.pagination.products = {
          total: totalProducts,
          page,
          limit,
          totalPages: Math.ceil(totalProducts / limit),
        };
      } else {
        results.pagination = {
          stores: { total: 0, page: 0, limit: 0, totalPages: 0 },
          products: {
            total: totalProducts,
            page,
            limit,
            totalPages: Math.ceil(totalProducts / limit),
          },
        };
      }
    }

    return results;
  }
}
