const { APP_ROUTE_PREFIX, JWT_SECRET_KEY } = process.env;

export const appConstants = {
  appRoutePrefix: APP_ROUTE_PREFIX,
  jwtSecretKey: JWT_SECRET_KEY,
};

export const validRoles = ['USER', 'ADMIN'];
