import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GetUser, GetAccessToken } from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(
    @Body() createContactDto: CreateContactDto,
    @GetUser() user: User,
    @GetAccessToken() accessToken: string
  ) {
    return this.contactsService.create(createContactDto, user.id, accessToken);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.contactsService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}