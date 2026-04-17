import { plainToInstance } from 'class-transformer';
import { UserRequest } from '../request/user-request';
import { UserResponse } from '../response/user-response';
import { User } from 'src/users/entities/user.entity';

export class UserConverte {
  static toUser(userRequest: UserRequest) {
    const user = new User();

    if (userRequest.idUser != null) {
      user.idUser = userRequest.idUser;
    }
    user.idUser = userRequest.idUser;
    user.firstName = userRequest.firstName;
    user.lastName = userRequest.lastName;
    user.username = userRequest.username;
    user.email = userRequest.email;
    user.password = userRequest.password;

    return user;
  }

  static toUserResponse(user: User): UserResponse {
    return plainToInstance(UserResponse, user, {
      excludeExtraneousValues: true,
    });
  }

  static toListUserResponse(users: User[] = []): UserResponse[] {
    return plainToInstance(UserResponse, users, {
      excludeExtraneousValues: true,
    });
  }
}
