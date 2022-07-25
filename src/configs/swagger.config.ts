import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

const { SWAGGER_ROUTE, SWAGGER_TITLE, SWAGGER_DESC, SWAGGER_VERSION, SWAGGER_SECURITY } = process.env;

export const swaggerConstants = {
  route: SWAGGER_ROUTE,
  title: SWAGGER_TITLE,
  description: SWAGGER_DESC,
  version: SWAGGER_VERSION,
  security: SWAGGER_SECURITY,
};

export const swaggerSecurityConfig: SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  name: 'JWT',
  description: 'Enter JWT token',
  in: 'header',
};
