const { DB_PORT, DB_HOST, DB_USER, DB_PASSWORD } = process.env;
export const connectionString =
  DB_USER && DB_PASSWORD ? `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?replicaSet=rs0` : `mongodb://${DB_HOST}:${DB_PORT}/?replicaSet=rs0`;
