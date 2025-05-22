import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser, GetAccessToken } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

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
}
