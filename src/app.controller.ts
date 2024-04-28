import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(@Request() req): string {
    if (req.user) {
      const userinfo = req.user.userinfo;
      const greeting = `Hello, ${userinfo.name}!`;
      const picture = `<img src="${userinfo.picture}" alt="User Picture" />`;
      const logoutLink = `<a href="/logout">Logout</a>`;
      return `${greeting}${picture}<br>${logoutLink}`;
    } else {
      return `${this.appService.getHello()} <a href="/login">Login</a>`;
    }
  }
}
