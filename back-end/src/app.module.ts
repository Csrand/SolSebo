import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { BooksModule } from './modules/books/books.module';
import { LibraryModule } from './modules/library/library.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ClubsModule } from './modules/clubs/clubs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(3306),
        DB_USERNAME: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.boolean().default(false),
        JWT_SECRET: Joi.string().required(),
        JWT_TTL: Joi.number().default(28800),
        JWT_REFRESH_TTL: Joi.number().default(604800),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().default(587),
        SMTP_USER: Joi.string().required(),
        SMTP_PASS: Joi.string().required(),
        SMTP_FROM: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        database: configService.get('DB_DATABASE'),
        password: configService.get('DB_PASSWORD'),
        autoLoadEntities: true,
        synchronize: configService.get('DB_SYNCHRONIZE'),
      }),
    }),
    UsersModule,
    AuthModule,
    MailModule,
    BooksModule,
    LibraryModule,
    SessionsModule,
    ClubsModule,
  ],
})
export class AppModule {}
