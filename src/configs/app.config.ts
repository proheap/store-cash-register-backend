const { APP_ROUTE_PREFIX, JWT_SECRET_KEY } = process.env;

export const appConstants = {
  appRoutePrefix: APP_ROUTE_PREFIX,
  jwtSecretKey: JWT_SECRET_KEY,
};

export enum validRoles {
  User = 'user',
  Admin = 'admin',
}
