import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { appConstants } from './configs/app.config';

@Controller(appConstants.appRoutePrefix)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
