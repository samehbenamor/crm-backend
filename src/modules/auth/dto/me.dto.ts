import { User } from '../../../common/interfaces/user.interface';
import { Client } from '../../../common/interfaces/client.interface';

export class MeResponseDto {
  user: User;
  client: Client;
}