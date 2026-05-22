import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clube } from './entities/clube.entity';
import { ClubeMembro } from './entities/clube-membro.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { PaginationDto, createPaginatedResponse, PaginatedResponse } from '../../commons';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Clube)
    private readonly clubsRepository: Repository<Clube>,
    @InjectRepository(ClubeMembro)
    private readonly membrosRepository: Repository<ClubeMembro>,
  ) {}

  async create(creatorId: number, dto: CreateClubDto): Promise<Clube> {
    const clube = this.clubsRepository.create({ ...dto, creatorId });
    const saved = await this.clubsRepository.save(clube);
    await this.membrosRepository.save({
      clubeId: saved.id,
      userId: creatorId,
      cargo: 'owner',
    });
    return saved;
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResponse<Clube>> {
    const limit = pagination?.limit ?? 10;
    const offset = pagination?.offset ?? 0;
    const [data, total] = await this.clubsRepository.findAndCount({ skip: offset, take: limit });
    return createPaginatedResponse(data, total, limit, offset, '/clubs');
  }

  async findById(id: number): Promise<Clube | null> {
    return this.clubsRepository.findOne({ where: { id } });
  }

  async getMembros(clubeId: number): Promise<ClubeMembro[]> {
    return this.membrosRepository.find({ where: { clubeId } });
  }

  async addMembro(clubeId: number, userId: number): Promise<ClubeMembro> {
    const membro = this.membrosRepository.create({ clubeId, userId });
    return this.membrosRepository.save(membro);
  }

  async update(id: number, dto: UpdateClubDto): Promise<Clube | null> {
    await this.clubsRepository.update(id, dto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const clube = await this.findById(id);
    if (!clube) throw new NotFoundException('Clube não encontrado');
    await this.membrosRepository.delete({ clubeId: id });
    await this.clubsRepository.delete(id);
  }
}
