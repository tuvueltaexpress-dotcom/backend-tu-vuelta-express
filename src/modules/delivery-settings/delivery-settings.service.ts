import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const SETTINGS_ID = 1;
const MAPBOX_DIRECTIONS_URL =
  'https://api.mapbox.com/directions/v5/mapbox/driving';

interface DirectionsResponse {
  code?: string;
  routes?: { distance: number }[];
}

@Injectable()
export class DeliverySettingsService {
  private readonly logger = new Logger(DeliverySettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get() {
    return this.prisma.deliverySettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });
  }

  async update(pricePerKm: number, minFee?: number) {
    return this.prisma.deliverySettings.upsert({
      where: { id: SETTINGS_ID },
      update: { pricePerKm, minFee },
      create: { id: SETTINGS_ID, pricePerKm, minFee },
    });
  }

  async quote(storeId: number, latitude: number, longitude: number) {
    const store = await this.prisma.stores.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (store.latitude === null || store.longitude === null) {
      throw new NotFoundException(
        'La tienda no tiene una ubicación configurada',
      );
    }

    const distanceKm = await this.getDrivingDistanceKm(
      { lat: store.latitude, lng: store.longitude },
      { lat: latitude, lng: longitude },
    );

    const settings = await this.get();
    const distanceFee = distanceKm * settings.pricePerKm;
    const minApplied = distanceFee < settings.minFee;
    const fee = minApplied ? settings.minFee : distanceFee;

    return {
      distanceKm: Math.round(distanceKm * 100) / 100,
      pricePerKm: settings.pricePerKm,
      minFee: settings.minFee,
      minApplied,
      fee: Math.round(fee * 100) / 100,
    };
  }

  private async getDrivingDistanceKm(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): Promise<number> {
    const token = process.env.MAPBOX_TOKEN;

    if (!token) {
      this.logger.error('MAPBOX_TOKEN no está configurado');
      throw new ServiceUnavailableException(
        'No se pudo calcular el costo de envío. Intenta más tarde.',
      );
    }

    const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${MAPBOX_DIRECTIONS_URL}/${coordinates}?access_token=${token}&overview=false`;

    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      this.logger.error(
        `Error de red al consultar Mapbox: ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo calcular el costo de envío. Intenta más tarde.',
      );
    }

    if (!response.ok) {
      this.logger.error(
        `Mapbox respondió ${response.status} al calcular la distancia`,
      );
      throw new ServiceUnavailableException(
        'No se pudo calcular el costo de envío. Intenta más tarde.',
      );
    }

    const data = (await response.json()) as DirectionsResponse;
    const distanceMeters = data.routes?.[0]?.distance;

    if (typeof distanceMeters !== 'number') {
      this.logger.warn(
        `Mapbox no devolvió una ruta (code: ${data.code ?? 'desconocido'})`,
      );
      throw new ServiceUnavailableException(
        'No encontramos una ruta hasta esa ubicación. Verifica el punto seleccionado.',
      );
    }

    return distanceMeters / 1000;
  }
}
