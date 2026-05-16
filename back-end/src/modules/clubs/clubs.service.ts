import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Clube } from './entities/clube.entity';
import { ClubeMembro } from './entities/clube-membro.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { PaginationDto, paginate, PaginatedResponse } from '../../commons';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Clube)
    private readonly clubsRepository: Repository<Clube>,
    @InjectRepository(ClubeMembro)
    private readonly membrosRepository: Repository<ClubeMembro>,
    private readonly dataSource: DataSource,
  ) {}

  async create(creatorId: number, dto: CreateClubDto): Promise<Clube> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const clube = await queryRunner.manager.save(Clube, {
        ...dto,
        creatorId,
      });
      await queryRunner.manager.save(ClubeMembro, {
        clubeId: clube.id,
        userId: creatorId,
        cargo: 'owner',
      });
      await queryRunner.commitTransaction();
      return clube;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    pagination?: PaginationDto,
    search?: string,
  ): Promise<PaginatedResponse<Clube>> {
    const where = search ? { name: ILike(`%${search}%`) } : undefined;
    return paginate(
      this.clubsRepository,
      pagination,
      '/clubs',
      where ? { where } : {},
    );
  }

  async findById(id: number): Promise<Clube | null> {
    return this.clubsRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
  }

  async getMembros(clubeId: number): Promise<ClubeMembro[]> {
    return this.membrosRepository.find({
      where: { clubeId },
      relations: ['user'],
    });
  }

  async addMembro(clubeId: number, userId: number): Promise<ClubeMembro> {
    const clube = await this.findById(clubeId);
    if (!clube) throw new NotFoundException('Clube não encontrado');
    if (!clube.isActive) throw new ForbiddenException('Clube está inativo');

    const existing = await this.membrosRepository.findOne({
      where: { clubeId, userId },
    });
    if (existing)
      throw new ConflictException('Usuário já é membro deste clube');

    const membro = this.membrosRepository.create({ clubeId, userId });
    return this.membrosRepository.save(membro);
  }

  async removeMembro(clubeId: number, userId: number): Promise<void> {
    const membro = await this.membrosRepository.findOne({
      where: { clubeId, userId },
    });
    if (!membro)
      throw new NotFoundException('Membro não encontrado neste clube');

    const clube = await this.findById(clubeId);
    if (!clube) throw new NotFoundException('Clube não encontrado');
    if (clube.creatorId === userId)
      throw new ForbiddenException('O criador não pode sair do clube');

    await this.membrosRepository.delete({ clubeId, userId });
  }

  async update(id: number, dto: UpdateClubDto): Promise<Clube | null> {
    const clube = await this.findById(id);
    if (!clube) return null;
    Object.assign(clube, dto);
    return this.clubsRepository.save(clube);
  }

  async remove(id: number): Promise<void> {
    const clube = await this.findById(id);
    if (!clube) throw new NotFoundException('Clube não encontrado');
    await this.clubsRepository.delete(id);
  }
}
