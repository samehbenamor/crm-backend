// promotion/qr-code.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrCodeService {
  async generateQRCode(data: string, promotionId: string, clientId: string): Promise<string> {
    const folderName = `${promotionId}-${clientId}`;
    const folderPath = path.join(process.cwd(), 'uploads', 'clients', folderName);
    const fileName = `${uuidv4()}.png`;
    const filePath = path.join(folderPath, fileName);

    // Create directory if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const relativePath = `uploads/clients/${folderName}/${fileName}`;
    // Generate QR code and save to file
    await QRCode.toFile(filePath, data, {
      type: 'png',
      errorCorrectionLevel: 'H',
      margin: 1,
      scale: 10,
    });

    return relativePath;
  }

  async deleteQRCodeFolder(promotionId: string, clientId: string): Promise<void> {
    const folderName = `${promotionId}-${clientId}`;
    const folderPath = path.join(process.cwd(), 'uploads', 'clients', folderName);

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
  }
}