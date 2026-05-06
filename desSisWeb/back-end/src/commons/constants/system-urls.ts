import { Users, Books } from './system-constants';

export const SERVER = 'localhost@8000';
export const CLIENT = 'localhost@3000';

const API = 'solsebo';

const CREATE = 'create';
const LIST = 'list';
const DELETE = 'delete';
const UPDATE = 'update';

function buildRoutes(entity: string, idParam: string) {
  const base = `/${API}/${entity}`;
  return {
    BASE: base,
    CREATE: `/${CREATE}`,
    LIST: `/${LIST}`,
    DELETE: `/${DELETE}/:${idParam}`,
    UPDATE: `/${UPDATE}/:${idParam}`,
    FIND_ONE: `/:${idParam}`,
  };
}

export const ROUTE = {
  Users: buildRoutes(Users, 'idUser'),
  Books: buildRoutes(Books, 'idBook'),
};
