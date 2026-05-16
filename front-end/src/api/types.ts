export interface PaginatedResponse<T> {
  data: T[];
  links: {
    self: string;
    first: string;
    next: string | null;
    prev: string | null;
    last: string | null;
  };
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
