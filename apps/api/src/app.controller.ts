import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'PikMoolya API is running!';
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'PikMoolya API',
      timestamp: new Date().toISOString(),
    };
  }
}