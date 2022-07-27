import { Module, HttpStatus } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { connectionString, dbName, dbProvideName } from '../../configs/database.config';
import { errorHandlingException } from '../../helpers/logger.helper';

const logLabel = 'DATABASE-MODULE';
@Module({
  providers: [
    {
      provide: dbProvideName,
      useFactory: async (): Promise<Db> => {
        try {
          const client = await MongoClient.connect(connectionString, {});
          return client.db(dbName);
        } catch (error) {
          errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      },
    },
  ],
  exports: [dbProvideName],
})
export class DatabaseModule {}
