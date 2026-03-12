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
    
    this.logger.log(`Cloudinary config - cloud_name: ${cloudName}, api_key: ${apiKey}`);
    this.logger.log(`CLOUDINARY_API_SECRET: ${apiSecret}`);
    
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
    this.logger.log(`Attempting to upload image to folder: ${folder}`);
    this.logger.log(`Cloudinary config: ${cloudinary.config().cloud_name}, ${cloudinary.config().api_key}`);
    
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
