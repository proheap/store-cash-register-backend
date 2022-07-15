import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { connectionString } from './configs/database.config';

@Module({
  imports: [MongooseModule.forRoot(connectionString), UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
