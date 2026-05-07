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
  const lastOffset = Math.floor(total / limit) * limit;
  const hasNext = offset + limit < total;
  const hasPrev = offset > 0;

  const buildUrl = (newOffset: number) =>
    `${baseUrl}?limit=${limit}&offset=${newOffset}`;

  return {
    data,
    links: {
      self: buildUrl(offset),
      first: buildUrl(0),
      next: hasNext ? buildUrl(offset + limit) : null,
      prev: hasPrev ? buildUrl(Math.max(0, offset - limit)) : null,
      last: lastOffset > 0 && total > lastOffset ? buildUrl(lastOffset) : (lastOffset > 0 ? buildUrl(lastOffset - limit) : null),
    },
    meta: {
      total,
      limit,
      offset,
    },
  };
}
