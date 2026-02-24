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
import { DeliveryOptionsService } from './delivery-options.service';
import { CreateDeliveryOptionDto, UpdateDeliveryOptionDto } from './dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

@Controller('delivery-options')
export class DeliveryOptionsController {
  constructor(
    private readonly deliveryOptionsService: DeliveryOptionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDeliveryOptionDto: CreateDeliveryOptionDto) {
    return this.deliveryOptionsService.create(createDeliveryOptionDto);
  }

  @Get()
  findAll() {
    return this.deliveryOptionsService.findAll();
  }

  @Get('store/:storeId')
  findByStore(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.deliveryOptionsService.findByStore(storeId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryOptionsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeliveryOptionDto: UpdateDeliveryOptionDto,
  ) {
    return this.deliveryOptionsService.update(id, updateDeliveryOptionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryOptionsService.remove(id);
  }
}
