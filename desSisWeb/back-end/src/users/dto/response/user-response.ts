import { Expose } from 'class-transformer';

export class UserResponse {
  @Expose()
  id?: number;

  @Expose()
  firstName: string = '';

  @Expose()
  lastName: string = '';

  @Expose()
  username: string = '';

  @Expose()
  email: string = '';

  @Expose()
  password: string = '';
}
