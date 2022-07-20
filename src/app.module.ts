import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { connectionString } from './configs/database.config';
import { UserModule } from './user/user.module';

@Module({
  imports: [MongooseModule.forRoot(connectionString), UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
