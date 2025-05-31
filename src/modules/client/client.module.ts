import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GeospatialService } from '../../common/services/geospatial.service'; // Direct import
@Module({
  imports: [PrismaModule],
  controllers: [ClientController],
  providers: [ClientService, GeospatialService],
  exports: [ClientService],
})
export class ClientModule {}
