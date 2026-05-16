import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const CHECK_OWNERSHIP_KEY = 'checkOwnership';

export interface OwnershipConfig {
  ownerField: string;
  entityName: string;
}

export const CheckOwnership = (config: OwnershipConfig) =>
  SetMetadata(CHECK_OWNERSHIP_KEY, config);

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<OwnershipConfig>(
      CHECK_OWNERSHIP_KEY,
      context.getHandler(),
    );

    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: number; is_admin: boolean } | undefined;

    if (!user) {
      throw new ForbiddenException('Autenticação necessária');
    }

    if (user.is_admin) {
      return true;
    }

    const id = Number(request.params['id']);
    const controller = context.getClass();
    const controllerInstance = context.getInstance();
    const serviceName = controller.name.replace('Controller', 'Service');
    const service = (controllerInstance as Record<string, unknown>)[
      serviceName.charAt(0).toLowerCase() + serviceName.slice(1)
    ] as Record<string, (id: number) => Promise<Record<string, unknown> | null>> | undefined;

    if (!service) {
      throw new ForbiddenException('Serviço não encontrado');
    }

    const entity = await service.findById?.(id);

    if (!entity) {
      throw new NotFoundException(`${config.entityName} não encontrado`);
    }

    const ownerId = entity[config.ownerField] as number | undefined;
    if (ownerId !== user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso',
      );
    }

    return true;
  }
}
