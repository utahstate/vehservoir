import { Controller, Get, Query, Render } from '@nestjs/common';
import type { HomeProps } from 'dto/Home';

@Controller()
export class AppController {
  @Render('home')
  @Get()
  public index(@Query('name') name?: string) : HomeProps {
    return { name: name || "guest" };
  }
}
