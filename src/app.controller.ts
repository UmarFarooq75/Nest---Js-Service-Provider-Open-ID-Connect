import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(@Request() req): string {
    if (req.user) {
      const userinfo = req.user.userinfo;
      const greeting = `Hello, ${userinfo.name}!`;
      const email = `Email: ${userinfo.email}`;
      const picture = `<img src="${userinfo.picture}" alt="User Picture" />`;
      const logoutLink = `<a href="/logout">Logout</a>`;
      return `${greeting}<br>${email}<br>${picture}<br>${logoutLink}`;
    } else {
      return `${this.appService.getHello()} <a href="/login">Login</a>`;
    }
  }
}
