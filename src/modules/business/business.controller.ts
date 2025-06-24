import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import {
  GetUser,
  GetAccessToken,
} from '../../common/decorators/user.decorator';
import { User } from '../../common/interfaces/user.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Business } from '../../common/interfaces/business.interface';
import { multerOptions } from 'src/config/multer.config';
import { MultiFilesInterceptor } from '../../common/interceptors/multi-files.interceptor';
@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}
  @Post()
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(
    MultiFilesInterceptor([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    ]),
  )
  async create(
    @Body() dto: CreateBusinessDto,
    @GetUser() user: User,
    @GetAccessToken() accessToken: string,
    @UploadedFiles()
    files?: {
      profileImage?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
  ): Promise<Business> {
    const profileImage = files?.profileImage?.[0];
    const coverImage = files?.coverImage?.[0];
    return this.businessService.create(
      dto,
      user.id,
      accessToken,
      profileImage,
      coverImage,
    );
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  async findAll(): Promise<Business[]> {
    return this.businessService.findAll();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  async findOne(@Param('id') id: string): Promise<Business> {
    return this.businessService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(
    MultiFilesInterceptor([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessDto,
    @UploadedFiles()
    files?: {
      profileImage?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
  ): Promise<Business> {
    const profileImage = files?.profileImage?.[0];
    const coverImage = files?.coverImage?.[0];
    return this.businessService.update(id, dto, profileImage, coverImage);
  }
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.businessService.remove(id);
  }

  @Get('owner/:ownerId')
@UseGuards(SupabaseAuthGuard)
async findByOwner(@Param('ownerId') ownerId: string): Promise<Business[]> {
  return this.businessService.findByOwner(ownerId);
}
}
