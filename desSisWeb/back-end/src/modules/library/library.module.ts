import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';
import { BibliotecaUsuario } from './entities/biblioteca-usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BibliotecaUsuario])],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
