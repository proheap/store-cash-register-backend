import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'isPublic';
export const PublicEndpoint = () => SetMetadata(PUBLIC_KEY, true);
