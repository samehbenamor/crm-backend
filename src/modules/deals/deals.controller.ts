import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser, GetAccessToken } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(
    @Body() createDealDto: CreateDealDto,
    @GetUser() user: User,
    @GetAccessToken() accessToken: string
  ) {
    return this.dealsService.create(createDealDto, user.id, accessToken);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.dealsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  update(@Param('id') id: string, @Body() updateDealDto: UpdateDealDto) {
    return this.dealsService.update(id, updateDealDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.dealsService.remove(id);
  }
}