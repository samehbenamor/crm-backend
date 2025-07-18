import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BusinessOwnerService } from './business-owner.service';
import { CreateBusinessOwnerDto } from './dto/create-business-owner.dto';
import { UpdateBusinessOwnerDto } from './dto/update-business-owner.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser, GetAccessToken } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('business-owners')
export class BusinessOwnerController {
  constructor(private readonly businessOwnerService: BusinessOwnerService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(
    @Body() dto: CreateBusinessOwnerDto,
    @GetUser() user: User,
    @GetAccessToken() accessToken: string
  ) {
    return this.businessOwnerService.create(dto, user.id, accessToken);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.businessOwnerService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.businessOwnerService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateBusinessOwnerDto) {
    return this.businessOwnerService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.businessOwnerService.remove(id);
  }
}
