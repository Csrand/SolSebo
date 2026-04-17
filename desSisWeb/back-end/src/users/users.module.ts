import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserServiceFindAll } from './services/user-service-findall';
import { UserServiceCreate } from './services/user-service-create';
import { UserControllerCreate } from './controllers/create-controller';
import { UserControllerFindAll } from './controllers/findall';

const userServices = [UserServiceFindAll, UserServiceCreate];
const userControllers = [UserControllerCreate, UserControllerFindAll];

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [...userControllers],
  providers: [...userServices],
})
export class UsersModule {}
