import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessaoLeitura } from './entities/sessao-leitura.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PaginationDto, createPaginatedResponse, PaginatedResponse } from '../../commons';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessaoLeitura)
    private readonly sessionsRepository: Repository<SessaoLeitura>,
  ) {}

  async create(userId: number, dto: CreateSessionDto): Promise<SessaoLeitura> {
    const session = new SessaoLeitura({ ...dto, userId, startedAt: new Date() });
    return this.sessionsRepository.save(session);
  }

  async findAllByUser(userId: number, pagination?: PaginationDto): Promise<PaginatedResponse<SessaoLeitura>> {
    const limit = pagination?.limit ?? 10;
    const offset = pagination?.offset ?? 0;
    const [data, total] = await this.sessionsRepository.findAndCount({
      where: { userId },
      skip: offset,
      take: limit,
      order: { startedAt: 'DESC' },
    });
    return createPaginatedResponse(data, total, limit, offset, '/sessions');
  }

  async findById(id: number): Promise<SessaoLeitura | null> {
    return this.sessionsRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateSessionDto): Promise<SessaoLeitura | null> {
    await this.sessionsRepository.update(id, dto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const session = await this.findById(id);
    if (!session) throw new NotFoundException('Sessão não encontrada');
    await this.sessionsRepository.delete(id);
  }
}
