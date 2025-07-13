import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import {
  GetUser,
  GetAccessToken,
} from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) { }

  /*@Post()
  @UseGuards(SupabaseAuthGuard)
  create(
    @Body() dto: CreateClientDto,
    @GetUser() user: User,
    @GetAccessToken() accessToken: string
  ) {
    return this.clientService.create(dto, user.id, accessToken);
  }*/

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.clientService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
  @Put(':id/location')
  @UseGuards(SupabaseAuthGuard)
  updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @GetUser() user: User,
  ) {
    return this.clientService.updateLocation(id, dto, user.id);
  }
  @Get(':id/nearby-businesses')
  @UseGuards(SupabaseAuthGuard)
  findNearbyBusinesses(
    @Param('id') id: string,
    @Query('radius') radius: string,
  ) {
    const radiusKm = radius ? parseFloat(radius) : 1; // Default 1km
    return this.clientService.findNearbyBusinesses(id, radiusKm);
  }
  @Put(':id/phone-number')
  @UseGuards(SupabaseAuthGuard)
  async updatePhoneNumber(
    @Param('id') id: string,
    @Body() dto: { phoneNumber: string },
    @GetUser() user: User,
  ) {
    return this.clientService.updatePhoneNumber(id, dto.phoneNumber, user.id);
  }
  // TODO: In the future we're going to implemen a way for the business to specify the amount of points to award
  // for now, we will just use a fixed amount of points.
  @Post(':id/award-referral-points')
  @UseGuards(SupabaseAuthGuard)
  async awardReferralPoints(
    @Param('id') clientId: string,
    @Body() dto: { businessId: string, points: number, referralId: string },
    @GetUser() user: User
  ) {
    // Verify requesting user owns the client
    const client = await this.clientService.findByUserId(user.id);
    if (!client || client.id !== clientId) {
      throw new NotFoundException('Client not found or unauthorized');
    }

    return this.clientService.awardReferralPoints(
      clientId,
      dto.businessId,
      dto.points,
      dto.referralId
    );
  }
}
