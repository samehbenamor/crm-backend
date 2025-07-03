// config/multer-qr.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerQRConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const { promotionId, clientId } = req.body;
      const path = `uploads/clients/${promotionId}-${clientId}`;
      require('fs').mkdirSync(path, { recursive: true });
      cb(null, path);
    },
    filename: (req, file, cb) => {
      const randomName = uuidv4();
      cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG files are allowed'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
};