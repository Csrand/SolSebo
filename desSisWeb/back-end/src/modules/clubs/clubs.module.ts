import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { Clube } from './entities/clube.entity';
import { ClubeMembro } from './entities/clube-membro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clube, ClubeMembro])],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
