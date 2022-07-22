const { OPEN_API_ROUTE, OPEN_API_TITLE, OPEN_API_DESC, OPEN_API_VERSION } = process.env;

export const swaggerConstants = {
  route: OPEN_API_ROUTE,
  title: OPEN_API_TITLE,
  description: OPEN_API_DESC,
  version: OPEN_API_VERSION,
};
