import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(
    email: string,
    password: string,
    businessName: string,
    phone: string,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'PARTNER',
        status: 'PENDING_APPROVAL',
        storePartner: {
          create: {
            businessName,
            phone,
          },
        },
      },
      include: {
        storePartner: true,
      },
    });

    return {
      message: 'Registro exitoso. Tu cuenta está pendiente de aprobación.',
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        businessName: user.storePartner?.businessName,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        storePartner: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.role !== 'PARTNER') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status === 'PENDING_APPROVAL') {
      throw new UnauthorizedException('Tu cuenta está pendiente de aprobación');
    }

    if (user.status === 'REJECTED') {
      throw new UnauthorizedException('Tu cuenta ha sido rechazada');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Tu cuenta está inactiva');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
      partner: {
        id: user.id,
        email: user.email,
        status: user.status,
        businessName: user.storePartner?.businessName,
        phone: user.storePartner?.phone,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        storePartner: {
          include: {
            stores: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      businessName: user.storePartner?.businessName,
      phone: user.storePartner?.phone,
      stores: user.storePartner?.stores,
    };
  }

  async createStore(
    userId: number,
    data: {
      name: string;
      image: string;
      coverImage?: string;
      categoryId: number;
      ha?: string;
      hc?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { storePartner: { include: { stores: true } } },
    });

    if (!user || user.role !== 'PARTNER') {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Tu cuenta debe estar activa para crear una tienda',
      );
    }

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

    let coverImageUrl: string | undefined;
    if (data.coverImage) {
      const coverImageResult = await this.cloudinaryService.uploadImage(
        data.coverImage,
        'jf3/stores/cover',
      );
      coverImageUrl = coverImageResult.secure_url;
    }

    const store = await this.prisma.stores.create({
      data: {
        name: data.name,
        image: imageResult.secure_url,
        coverImage: coverImageUrl,
        categoryId: data.categoryId,
        ha: data.ha,
        hc: data.hc,
        partnerId: user.storePartner!.id,
      },
      include: {
        category: true,
      },
    });

    return store;
  }

  async updateStore(
    userId: number,
    storeId: number,
    data: {
      name?: string;
      image?: string;
      coverImage?: string;
      categoryId?: number;
      ha?: string;
      hc?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { storePartner: true },
    });

    if (!user || user.role !== 'PARTNER') {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const existingStore = await this.prisma.stores.findUnique({
      where: { id: storeId },
    });

    if (!existingStore) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (existingStore.partnerId !== user.storePartner?.id) {
      throw new ForbiddenException('No tienes permisos sobre esta tienda');
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
      where: { id: storeId },
      data: {
        name: data.name,
        image: imageUrl,
        coverImage: coverImageUrl,
        categoryId: data.categoryId,
        ha: data.ha,
        hc: data.hc,
      },
      include: {
        category: true,
      },
    });
  }

  async getMyStore(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { storePartner: true },
    });

    if (!user || user.role !== 'PARTNER') {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const store = await this.prisma.stores.findFirst({
      where: { partnerId: user.storePartner?.id },
      include: {
        category: true,
        products: true,
        productsCategories: true,
        deliveryOptions: true,
      },
    });

    if (!store) {
      throw new NotFoundException('No tienes una tienda creada');
    }

    return store;
  }

  private async getStoreAndValidatePartner(userId: number, storeId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { storePartner: true },
    });

    if (!user || user.role !== 'PARTNER') {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    let store;
    if (storeId) {
      store = await this.prisma.stores.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        throw new NotFoundException('Tienda no encontrada');
      }

      if (store.partnerId !== user.storePartner?.id) {
        throw new ForbiddenException('No tienes permisos sobre esta tienda');
      }
    } else {
      store = await this.prisma.stores.findFirst({
        where: { partnerId: user.storePartner?.id },
      });

      if (!store) {
        throw new NotFoundException('No tienes una tienda creada');
      }
    }

    return store;
  }

  async createProduct(
    userId: number,
    data: {
      title: string;
      price: number;
      images: string[];
      description: string;
      categoryId: number;
    },
  ) {
    const store = await this.getStoreAndValidatePartner(userId);

    const category = await this.prisma.productsCategories.findUnique({
      where: { id: data.categoryId },
    });

    if (!category || category.storeId !== store.id) {
      throw new NotFoundException('Categoría de producto no encontrada');
    }

    const imageUrls: string[] = [];
    for (const image of data.images) {
      const result = await this.cloudinaryService.uploadImage(
        image,
        'jf3/products',
      );
      imageUrls.push(result.secure_url);
    }

    const product = await this.prisma.product.create({
      data: {
        title: data.title,
        price: data.price,
        images: imageUrls,
        description: data.description,
        storeId: store.id,
        categoryId: data.categoryId,
      },
      include: {
        store: true,
        category: true,
      },
    });

    return product;
  }

  private isBase64Image(image: string): boolean {
    return image.startsWith('data:image');
  }

  async updateProduct(
    userId: number,
    productId: number,
    data: {
      title?: string;
      price?: number;
      images?: string[];
      description?: string;
      categoryId?: number;
    },
  ) {
    const store = await this.getStoreAndValidatePartner(userId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.storeId !== store.id) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (data.categoryId) {
      const category = await this.prisma.productsCategories.findUnique({
        where: { id: data.categoryId },
      });

      if (!category || category.storeId !== store.id) {
        throw new NotFoundException('Categoría de producto no encontrada');
      }
    }

    let imageUrls = product.images;
    if (data.images && data.images.length > 0) {
      const previousImages = product.images;
      const newImages = data.images;

      const imagesToDelete = previousImages.filter(
        (img) => !newImages.includes(img),
      );
      for (const image of imagesToDelete) {
        const publicId = this.cloudinaryService.extractPublicId(image);
        await this.cloudinaryService.deleteImage(publicId);
      }

      imageUrls = [];
      for (const image of newImages) {
        if (this.isBase64Image(image)) {
          const result = await this.cloudinaryService.uploadImage(
            image,
            'jf3/products',
          );
          imageUrls.push(result.secure_url);
        } else {
          imageUrls.push(image);
        }
      }
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        price: data.price,
        images: imageUrls,
        description: data.description,
        categoryId: data.categoryId,
      },
      include: {
        store: true,
        category: true,
      },
    });
  }

  async deleteProduct(userId: number, productId: number) {
    const store = await this.getStoreAndValidatePartner(userId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.storeId !== store.id) {
      throw new NotFoundException('Producto no encontrado');
    }

    for (const image of product.images) {
      const publicId = this.cloudinaryService.extractPublicId(image);
      await this.cloudinaryService.deleteImage(publicId);
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { message: 'Producto eliminado correctamente' };
  }

  async getMyProducts(userId: number, page: number = 1, limit: number = 20) {
    const store = await this.getStoreAndValidatePartner(userId);

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { storeId: store.id },
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
      this.prisma.product.count({ where: { storeId: store.id } }),
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

  async createDeliveryOption(
    userId: number,
    data: {
      name: string;
      fee: number;
    },
  ) {
    const store = await this.getStoreAndValidatePartner(userId);

    const deliveryOption = await this.prisma.deliveryOptions.create({
      data: {
        name: data.name,
        fee: data.fee,
        storeId: store.id,
      },
      include: {
        store: true,
      },
    });

    return deliveryOption;
  }

  async updateDeliveryOption(
    userId: number,
    deliveryOptionId: number,
    data: {
      name?: string;
      fee?: number;
    },
  ) {
    const store = await this.getStoreAndValidatePartner(userId);

    const deliveryOption = await this.prisma.deliveryOptions.findUnique({
      where: { id: deliveryOptionId },
    });

    if (!deliveryOption || deliveryOption.storeId !== store.id) {
      throw new NotFoundException('Opción de delivery no encontrada');
    }

    return this.prisma.deliveryOptions.update({
      where: { id: deliveryOptionId },
      data: {
        name: data.name,
        fee: data.fee,
      },
      include: {
        store: true,
      },
    });
  }

  async deleteDeliveryOption(userId: number, deliveryOptionId: number) {
    const store = await this.getStoreAndValidatePartner(userId);

    const deliveryOption = await this.prisma.deliveryOptions.findUnique({
      where: { id: deliveryOptionId },
    });

    if (!deliveryOption || deliveryOption.storeId !== store.id) {
      throw new NotFoundException('Opción de delivery no encontrada');
    }

    await this.prisma.deliveryOptions.delete({
      where: { id: deliveryOptionId },
    });

    return { message: 'Opción de delivery eliminada correctamente' };
  }

  async getMyDeliveryOptions(userId: number) {
    const store = await this.getStoreAndValidatePartner(userId);

    const deliveryOptions = await this.prisma.deliveryOptions.findMany({
      where: { storeId: store.id },
      include: {
        store: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return deliveryOptions;
  }

  async createProductCategory(
    userId: number,
    data: {
      name: string;
    },
  ) {
    const store = await this.getStoreAndValidatePartner(userId);

    const productCategory = await this.prisma.productsCategories.create({
      data: {
        name: data.name,
        storeId: store.id,
      },
      include: {
        store: true,
      },
    });

    return productCategory;
  }

  async updateProductCategory(
    userId: number,
    categoryId: number,
    data: {
      name?: string;
    },
  ) {
    const store = await this.getStoreAndValidatePartner(userId);

    const category = await this.prisma.productsCategories.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.storeId !== store.id) {
      throw new NotFoundException('Categoría de producto no encontrada');
    }

    return this.prisma.productsCategories.update({
      where: { id: categoryId },
      data: {
        name: data.name,
      },
      include: {
        store: true,
      },
    });
  }

  async deleteProductCategory(userId: number, categoryId: number) {
    const store = await this.getStoreAndValidatePartner(userId);

    const category = await this.prisma.productsCategories.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.storeId !== store.id) {
      throw new NotFoundException('Categoría de producto no encontrada');
    }

    await this.prisma.productsCategories.delete({
      where: { id: categoryId },
    });

    return { message: 'Categoría de producto eliminada correctamente' };
  }

  async getMyProductCategories(userId: number) {
    const store = await this.getStoreAndValidatePartner(userId);

    const categories = await this.prisma.productsCategories.findMany({
      where: { storeId: store.id },
      include: {
        store: true,
        products: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return categories;
  }

  async getDashboard(userId: number) {
    const store = await this.getStoreAndValidatePartner(userId);

    const [productsCount, categoriesCount, deliveryOptionsCount] =
      await Promise.all([
        this.prisma.product.count({ where: { storeId: store.id } }),
        this.prisma.productsCategories.count({ where: { storeId: store.id } }),
        this.prisma.deliveryOptions.count({ where: { storeId: store.id } }),
      ]);

    return {
      store: {
        id: store.id,
        name: store.name,
        image: store.image,
        coverImage: store.coverImage,
        ha: store.ha,
        hc: store.hc,
        category: store.category,
      },
      stats: {
        productsCount,
        categoriesCount,
        deliveryOptionsCount,
      },
    };
  }
}
