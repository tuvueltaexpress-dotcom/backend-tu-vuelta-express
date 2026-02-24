import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsCategoriesService } from './products-categories.service';
import { CreateProductCategoryDto, UpdateProductCategoryDto } from './dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

@Controller('products-categories')
export class ProductsCategoriesController {
  constructor(
    private readonly productsCategoriesService: ProductsCategoriesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    return this.productsCategoriesService.create(createProductCategoryDto);
  }

  @Get()
  findAll() {
    return this.productsCategoriesService.findAll();
  }

  @Get('store/:storeId')
  findByStore(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.productsCategoriesService.findByStore(storeId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsCategoriesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    return this.productsCategoriesService.update(id, updateProductCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsCategoriesService.remove(id);
  }
}
