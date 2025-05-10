import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessOwnerDto } from './create-business-owner.dto';

export class UpdateBusinessOwnerDto extends PartialType(CreateBusinessOwnerDto) {}
