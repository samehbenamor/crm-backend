// multi-files.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
  Type,
} from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as multer from 'multer';
import { Observable } from 'rxjs';
import { Options as MulterNativeOptions } from 'multer';
import { existsSync, mkdirSync } from 'fs';
export function MultiFilesInterceptor(
  fields: { name: string; maxCount?: number }[],
  localOptions?: MulterOptions,
): Type<NestInterceptor> {
const storage = diskStorage({
  destination: (req, file, cb) => {
    const tempDir = './uploads/temp';
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = file.originalname.split('.').pop();
    const filename = `${file.fieldname}-${uniqueSuffix}.${ext}`;
    cb(null, filename);
  },
});

  const defaultOptions: MulterOptions = {
    storage,
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error(`Invalid file type for ${file.fieldname}`), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    ...localOptions,
  };

    const multerInstance = multer(defaultOptions as MulterNativeOptions).fields(fields);

  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
      const req = ctx.getRequest();

      return new Promise((resolve, reject) => {
        multerInstance(req, req.res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(next.handle());
          }
        });
      });
    }
  }

  return mixin(MixinInterceptor);
}
