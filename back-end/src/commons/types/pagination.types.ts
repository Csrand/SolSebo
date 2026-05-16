import { Repository, FindManyOptions } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

export interface PaginationLinks {
  self: string;
  first: string;
  next: string | null;
  prev: string | null;
  last: string | null;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number,
  baseUrl: string,
): PaginatedResponse<T> {
  const lastOffset =
    total > 0 ? Math.max(0, Math.ceil(total / limit) * limit - limit) : 0;
  const hasNext = offset + limit < total;
  const hasPrev = offset > 0;
  const hasMultiplePages = total > limit;
  const buildUrl = (newOffset: number) =>
    `${baseUrl}?limit=${limit}&offset=${newOffset}`;

  return {
    data,
    links: {
      self: buildUrl(offset),
      first: buildUrl(0),
      next: hasNext ? buildUrl(offset + limit) : null,
      prev: hasPrev ? buildUrl(Math.max(0, offset - limit)) : null,
      last: hasMultiplePages ? buildUrl(lastOffset) : null,
    },
    meta: { total, limit, offset },
  };
}

export async function paginate<T extends Record<string, any>>(
  repository: Repository<T>,
  pagination: PaginationDto | undefined,
  baseUrl: string,
  options: Omit<FindManyOptions<T>, 'skip' | 'take'> = {},
): Promise<PaginatedResponse<T>> {
  const limit = pagination?.limit ?? 10;
  const offset = pagination?.offset ?? 0;

  const [data, total] = await repository.findAndCount({
    ...options,
    skip: offset,
    take: limit,
  });

  return createPaginatedResponse(data, total, limit, offset, baseUrl);
}
