import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  onModuleInit() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    // Nunca imprimir los valores: estos logs quedan en el panel del proveedor
    // de despliegue. Basta con saber si la configuración llegó completa.
    const faltantes = [
      !cloudName && 'CLOUDINARY_CLOUD_NAME',
      !apiKey && 'CLOUDINARY_API_KEY',
      !apiSecret && 'CLOUDINARY_API_SECRET',
    ].filter(Boolean);

    if (faltantes.length > 0) {
      this.logger.warn(
        `Cloudinary sin configurar: falta ${faltantes.join(', ')}. La subida de imágenes fallará.`,
      );
    } else {
      this.logger.log(`Cloudinary configurado (cloud_name: ${cloudName}).`);
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadImage(
    base64Image: string,
    folder: string = 'jf3',
  ): Promise<CloudinaryUploadResult> {
    this.logger.log(`Subiendo imagen a la carpeta: ${folder}`);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Image,
        { folder, resource_type: 'image' },
        (error, result) => {
            if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}, code: ${error.code}`);
            reject(new Error(error.message));
          } else if (result) {
            this.logger.log(`Upload successful: ${result.secure_url}`);
            resolve(result as CloudinaryUploadResult);
          } else {
            reject(new Error('No result from Cloudinary'));
          }
        },
      );
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error) => {
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve();
        }
      });
    });
  }

  extractPublicId(url: string): string {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return url;

    const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    return publicId;
  }
}
