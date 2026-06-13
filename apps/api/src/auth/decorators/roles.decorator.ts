import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@food-delivery/types';

export const ROLES_KEY = 'roles';

// usage: @Roles('ADMIN', 'USER') above the controller methods
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
