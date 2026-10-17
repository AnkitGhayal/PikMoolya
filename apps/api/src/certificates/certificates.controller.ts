import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { CertificatesService } from './certificates.service.js';
import { CreateCertificateDto } from './dto/create-certificate.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCertificate(@Req() req: any, @Body() dto: CreateCertificateDto) {
    return this.certificatesService.createCertificate(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyCertificates(@Req() req: any) {
    return this.certificatesService.getMyCertificates(req.user.userId);
  }

  @Get('verify/:certificateId')
  async verifyCertificate(@Param('certificateId') certificateId: string) {
    return this.certificatesService.verifyCertificate(certificateId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getCertificateById(@Req() req: any, @Param('id') id: string) {
    return this.certificatesService.getCertificateById(id, req.user.userId);
  }

  @Get(':id/pdf')
  async getCertificatePdf(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.certificatesService.getCertificatePdfStream(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="certificate_${id}.pdf"`);
    stream.pipe(res);
  }
}
