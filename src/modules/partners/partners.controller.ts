import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import {
  RegisterPartnerDto,
  LoginPartnerDto,
  CreateStoreDto,
  UpdateStoreDto,
  CreateProductDto,
  UpdateProductDto,
  CreateDeliveryOptionDto,
  UpdateDeliveryOptionDto,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto';
import { JwtPartnerAuthGuard } from './guards/jwt-partner-auth.guard';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post('register')
  register(@Body() registerDto: RegisterPartnerDto) {
    return this.partnersService.register(
      registerDto.email,
      registerDto.password,
      registerDto.businessName,
      registerDto.phone,
    );
  }

  @Post('login')
  login(@Body() loginDto: LoginPartnerDto) {
    return this.partnersService.login(loginDto.email, loginDto.password);
  }

  @Get('profile')
  @UseGuards(JwtPartnerAuthGuard)
  getProfile(@Request() req: any) {
    return this.partnersService.getProfile(req.user.sub);
  }

  @Post('store')
  @UseGuards(JwtPartnerAuthGuard)
  createStore(@Body() createStoreDto: CreateStoreDto, @Request() req: any) {
    return this.partnersService.createStore(req.user.sub, {
      name: createStoreDto.name,
      image: createStoreDto.image,
      coverImage: createStoreDto.coverImage,
      categoryId: createStoreDto.categoryId,
      ha: createStoreDto.ha,
      hc: createStoreDto.hc,
    });
  }

  @Get('store')
  @UseGuards(JwtPartnerAuthGuard)
  getMyStore(@Request() req: any) {
    return this.partnersService.getMyStore(req.user.sub);
  }

  @Put('store/:id')
  @UseGuards(JwtPartnerAuthGuard)
  updateStore(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Request() req: any,
  ) {
    return this.partnersService.updateStore(req.user.sub, +id, {
      name: updateStoreDto.name,
      image: updateStoreDto.image,
      coverImage: updateStoreDto.coverImage,
      categoryId: updateStoreDto.categoryId,
      ha: updateStoreDto.ha,
      hc: updateStoreDto.hc,
    });
  }

  @Post('products')
  @UseGuards(JwtPartnerAuthGuard)
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @Request() req: any,
  ) {
    return this.partnersService.createProduct(req.user.sub, {
      title: createProductDto.title,
      price: createProductDto.price,
      images: createProductDto.images,
      description: createProductDto.description,
      categoryId: createProductDto.categoryId,
    });
  }

  @Get('products')
  @UseGuards(JwtPartnerAuthGuard)
  getMyProducts(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.partnersService.getMyProducts(
      req.user.sub,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Put('products/:id')
  @UseGuards(JwtPartnerAuthGuard)
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    return this.partnersService.updateProduct(req.user.sub, +id, {
      title: updateProductDto.title,
      price: updateProductDto.price,
      images: updateProductDto.images,
      description: updateProductDto.description,
      categoryId: updateProductDto.categoryId,
    });
  }

  @Delete('products/:id')
  @UseGuards(JwtPartnerAuthGuard)
  deleteProduct(@Param('id') id: string, @Request() req: any) {
    return this.partnersService.deleteProduct(req.user.sub, +id);
  }

  @Post('delivery-options')
  @UseGuards(JwtPartnerAuthGuard)
  createDeliveryOption(
    @Body() createDeliveryOptionDto: CreateDeliveryOptionDto,
    @Request() req: any,
  ) {
    return this.partnersService.createDeliveryOption(req.user.sub, {
      name: createDeliveryOptionDto.name,
      fee: createDeliveryOptionDto.fee,
    });
  }

  @Get('delivery-options')
  @UseGuards(JwtPartnerAuthGuard)
  getMyDeliveryOptions(@Request() req: any) {
    return this.partnersService.getMyDeliveryOptions(req.user.sub);
  }

  @Put('delivery-options/:id')
  @UseGuards(JwtPartnerAuthGuard)
  updateDeliveryOption(
    @Param('id') id: string,
    @Body() updateDeliveryOptionDto: UpdateDeliveryOptionDto,
    @Request() req: any,
  ) {
    return this.partnersService.updateDeliveryOption(req.user.sub, +id, {
      name: updateDeliveryOptionDto.name,
      fee: updateDeliveryOptionDto.fee,
    });
  }

  @Delete('delivery-options/:id')
  @UseGuards(JwtPartnerAuthGuard)
  deleteDeliveryOption(@Param('id') id: string, @Request() req: any) {
    return this.partnersService.deleteDeliveryOption(req.user.sub, +id);
  }

  @Post('products-categories')
  @UseGuards(JwtPartnerAuthGuard)
  createProductCategory(
    @Body() createProductCategoryDto: CreateProductCategoryDto,
    @Request() req: any,
  ) {
    return this.partnersService.createProductCategory(req.user.sub, {
      name: createProductCategoryDto.name,
    });
  }

  @Get('products-categories')
  @UseGuards(JwtPartnerAuthGuard)
  getMyProductCategories(@Request() req: any) {
    return this.partnersService.getMyProductCategories(req.user.sub);
  }

  @Put('products-categories/:id')
  @UseGuards(JwtPartnerAuthGuard)
  updateProductCategory(
    @Param('id') id: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
    @Request() req: any,
  ) {
    return this.partnersService.updateProductCategory(req.user.sub, +id, {
      name: updateProductCategoryDto.name,
    });
  }

  @Delete('products-categories/:id')
  @UseGuards(JwtPartnerAuthGuard)
  deleteProductCategory(@Param('id') id: string, @Request() req: any) {
    return this.partnersService.deleteProductCategory(req.user.sub, +id);
  }

  @Get('dashboard')
  @UseGuards(JwtPartnerAuthGuard)
  getDashboard(@Request() req: any) {
    return this.partnersService.getDashboard(req.user.sub);
  }
}
