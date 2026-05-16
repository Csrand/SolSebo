# SolSebo - Back-end

NestJS API para gerenciamento de leitura pessoal.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm run start:dev
```

## Scripts

- `pnpm run start:dev` — servidor de desenvolvimento (porta 5000)
- `pnpm run build` — compilar para produção
- `pnpm run test` — rodar testes
- `pnpm run lint` — verificar lint

## Stack

- NestJS 11 + TypeScript
- TypeORM + MariaDB/MySQL
- Passport JWT (autenticação)
- Nodemailer (envio de email)
- class-validator (validação de DTOs)
