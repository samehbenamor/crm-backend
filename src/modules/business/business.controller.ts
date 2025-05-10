import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser, GetAccessToken } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(
    @Body() dto: CreateBusinessDto,
    @GetUser() user: User,
    @GetAccessToken() accessToken: string
  ) {
    return this.businessService.create(dto, user.id, accessToken);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.businessService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.businessService.remove(id);
  }
}
