import { Button } from "./Button";

interface PaginationLinks {
  self: string;
  first: string;
  next: string | null;
  prev: string | null;
  last: string | null;
}

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

interface PaginationProps {
  links: PaginationLinks;
  meta: PaginationMeta;
  onPageChange: (url: string) => void;
}

function Pagination({ links, meta, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(meta.offset / meta.limit) + 1;
  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="pagination">
      <div className="pagination__info">
        Mostrando {meta.offset + 1} - {Math.min(meta.offset + meta.limit, meta.total)} de {meta.total}
      </div>
      <div className="pagination__nav">
        <Button variant="secondary" onClick={() => onPageChange(links.first)} disabled={!links.prev && currentPage === 1}>
          Primeira
        </Button>
        <Button variant="secondary" onClick={() => links.prev && onPageChange(links.prev)} disabled={!links.prev}>
          Anterior
        </Button>
        <span className="pagination__page">Página {currentPage} de {totalPages || 1}</span>
        <Button variant="secondary" onClick={() => links.next && onPageChange(links.next)} disabled={!links.next}>
          Próxima
        </Button>
        <Button variant="secondary" onClick={() => links.last && onPageChange(links.last)} disabled={!links.last}>
          Última
        </Button>
      </div>
    </div>
  );
}

export { Pagination };
export type { PaginationLinks, PaginationMeta };
