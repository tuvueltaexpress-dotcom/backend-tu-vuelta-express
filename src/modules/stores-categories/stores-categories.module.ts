import { Module } from '@nestjs/common';
import { StoresCategoriesController } from './stores-categories.controller';
import { StoresCategoriesService } from './stores-categories.service';

@Module({
  controllers: [StoresCategoriesController],
  providers: [StoresCategoriesService],
  exports: [StoresCategoriesService],
})
export class StoresCategoriesModule {}
