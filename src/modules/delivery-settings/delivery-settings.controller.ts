import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { DeliverySettingsService } from './delivery-settings.service';
import { UpdateDeliverySettingsDto, QuoteDeliveryDto } from './dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

@Controller('delivery-settings')
export class DeliverySettingsController {
  constructor(
    private readonly deliverySettingsService: DeliverySettingsService,
  ) {}

  @Get()
  get() {
    return this.deliverySettingsService.get();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  update(@Body() updateDeliverySettingsDto: UpdateDeliverySettingsDto) {
    return this.deliverySettingsService.update(
      updateDeliverySettingsDto.pricePerKm,
      updateDeliverySettingsDto.minFee,
    );
  }

  @Post('quote')
  quote(@Body() quoteDeliveryDto: QuoteDeliveryDto) {
    return this.deliverySettingsService.quote(
      quoteDeliveryDto.storeId,
      quoteDeliveryDto.latitude,
      quoteDeliveryDto.longitude,
    );
  }
}
