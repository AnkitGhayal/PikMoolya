import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { PriceFloorController } from './price-floor.controller.js';
import { PriceFloorService } from './price-floor.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [PriceFloorController],
  providers: [PriceFloorService],
  exports: [PriceFloorService],
})
export class PriceFloorModule {}
