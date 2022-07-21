const { DB_PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
export const connectionString =
  DB_USER && DB_PASSWORD ? `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}` : `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
