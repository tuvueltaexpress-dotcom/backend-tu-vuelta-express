import { Module } from '@nestjs/common';
import { ProductsCategoriesController } from './products-categories.controller';
import { ProductsCategoriesService } from './products-categories.service';

@Module({
  controllers: [ProductsCategoriesController],
  providers: [ProductsCategoriesService],
  exports: [ProductsCategoriesService],
})
export class ProductsCategoriesModule {}
