import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    base64Image: string,
    folder: string = 'jf3',
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Image,
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) {
            reject(new Error(error.message));
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        },
      );
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error) => {
        if (error) {
          reject(error);
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

    const publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    return publicId;
  }
}
