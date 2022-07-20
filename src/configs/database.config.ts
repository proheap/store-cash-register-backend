const { DB_PORT, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
export const connectionString = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?directConnection=true`;
