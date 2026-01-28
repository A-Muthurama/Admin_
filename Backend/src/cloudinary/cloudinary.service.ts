import { Injectable } from '@nestjs/common';
import cloudinary from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File, folder: string) {
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (and ensure .env is loaded).',
      );
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });
  }
}
