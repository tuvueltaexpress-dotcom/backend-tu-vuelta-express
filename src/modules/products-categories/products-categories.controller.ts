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
  Query,
  DefaultValuePipe,
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
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.productsCategoriesService.findAll(page, limit);
  }

  @Get('store/:storeId')
  findByStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.productsCategoriesService.findByStore(storeId, page, limit);
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
