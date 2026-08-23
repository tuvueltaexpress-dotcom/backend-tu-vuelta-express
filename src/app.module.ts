import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { CloudinaryService } from './common/services/cloudinary.service';
import { AdminModule } from './modules/admin/admin.module';
import { PartnersModule } from './modules/partners/partners.module';
import { StoresCategoriesModule } from './modules/stores-categories/stores-categories.module';
import { StoresModule } from './modules/stores/stores.module';
import { ProductsCategoriesModule } from './modules/products-categories/products-categories.module';
import { ProductsModule } from './modules/products/products.module';
import { DeliverySettingsModule } from './modules/delivery-settings/delivery-settings.module';
import { SearchModule } from './modules/search/search.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AdminModule,
    PartnersModule,
    StoresCategoriesModule,
    StoresModule,
    ProductsCategoriesModule,
    ProductsModule,
    DeliverySettingsModule,
    SearchModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY || 'jf3-delivery-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, CloudinaryService],
  exports: [PrismaService, CloudinaryService],
})
export class AppModule {}
