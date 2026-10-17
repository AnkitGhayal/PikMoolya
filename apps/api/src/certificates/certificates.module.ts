import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Certificate } from './entities/certificate.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CertificatesController } from './certificates.controller.js';
import { CertificatesService } from './certificates.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([Certificate, User]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
