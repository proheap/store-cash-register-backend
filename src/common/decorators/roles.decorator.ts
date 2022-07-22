import { SetMetadata } from '@nestjs/common';
import { validRoles } from '../../configs/app.config';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: validRoles[]) => SetMetadata(ROLES_KEY, roles);
