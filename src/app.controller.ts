import { BE_ROUTE_PREFIX } from './configs/app.config';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(BE_ROUTE_PREFIX)
  getHello(): string {
    return this.appService.getHello();
  }
}
