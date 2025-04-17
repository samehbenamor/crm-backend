import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser, GetAccessToken } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @GetUser() user: User,
    @GetAccessToken() accessToken: string
  ) {
    return this.companiesService.create(createCompanyDto, user.id, accessToken);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}