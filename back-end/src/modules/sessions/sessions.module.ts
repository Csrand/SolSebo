import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessaoLeitura } from './entities/sessao-leitura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessaoLeitura])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
