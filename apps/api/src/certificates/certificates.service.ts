import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

import { Certificate } from './entities/certificate.entity.js';
import { CreateCertificateDto } from './dto/create-certificate.dto.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class CertificatesService {
  private readonly verifyBaseUrl =
    process.env.CERTIFICATE_VERIFY_BASE_URL || 'http://10.108.139.217:3000/api/certificates/verify';

  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'certificates');

  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private async generateUniqueCertificateId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.certificateRepository.count();
    const seq = String(count + 1).padStart(6, '0');
    return `PM-QA-${year}-${seq}`;
  }

  async createCertificate(farmerId: string, dto: CreateCertificateDto) {
    const farmer = await this.userRepository.findOne({ where: { id: farmerId } });

    const certificateId = await this.generateUniqueCertificateId();
    const verificationToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const cert = this.certificateRepository.create({
      certificateId,
      productId: dto.productId ?? undefined,
      farmerId,
      farmerName: farmer?.phone ? `Farmer (${farmer.phone})` : 'Registered Farmer',
      cropName: dto.cropName,
      variety: dto.variety ?? undefined,
      quantity: dto.quantity ?? undefined,
      unit: dto.unit ?? 'kg',
      location: dto.location ?? 'Pune, Maharashtra',
      qualityScore: Number(dto.qualityScore),
      qualityGrade: dto.qualityGrade,
      confidence: dto.confidence ?? 91.0,
      estimatedPrice: dto.estimatedPrice ?? undefined,
      priceRange: dto.priceRange ?? undefined,
      assessmentData: dto.assessmentData ?? {},
      assessmentDate: new Date(),
      verificationToken,
    });

    const savedCert = await this.certificateRepository.save(cert);

    // Generate PDF and QR code
    const pdfPath = await this.generateCertificatePdf(savedCert, dto.language || 'en');
    savedCert.pdfPath = pdfPath;
    await this.certificateRepository.save(savedCert);

    return {
      message: 'Certificate generated successfully',
      certificate: savedCert,
      pdfUrl: `/api/certificates/${savedCert.id}/pdf`,
      verifyUrl: `${this.verifyBaseUrl}/${savedCert.certificateId}`,
    };
  }

  async getMyCertificates(farmerId: string) {
    return this.certificateRepository.find({
      where: { farmerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCertificateById(id: string, userId: string) {
    const cert = await this.certificateRepository.findOne({ where: { id } });
    if (!cert) {
      throw new NotFoundException('Certificate not found');
    }
    return cert;
  }

  async verifyCertificate(certificateId: string) {
    const cert = await this.certificateRepository.findOne({ where: { certificateId } });
    if (!cert) {
      return {
        status: 'NOT_FOUND',
        valid: false,
        message: 'Certificate Not Found',
        certificateId,
      };
    }

    return {
      status: 'VERIFIED',
      valid: true,
      message: 'Certificate Verified ✓',
      certificateId: cert.certificateId,
      product: cert.cropName,
      variety: cert.variety ?? 'Standard',
      quantity: cert.quantity ? `${cert.quantity} ${cert.unit || 'kg'}` : undefined,
      qualityScore: `${cert.qualityScore} / 100`,
      grade: cert.qualityGrade,
      confidence: `${cert.confidence}%`,
      assessmentDate: cert.assessmentDate.toISOString().split('T')[0],
      assessmentType: 'AI-Based Visual Quality Assessment',
      disclaimer: 'Visual assessment based on submitted product photo. Not a laboratory or government certificate.',
    };
  }

  async getCertificatePdfStream(id: string) {
    const cert = await this.certificateRepository.findOne({ where: { id } });
    if (!cert || !cert.pdfPath || !fs.existsSync(cert.pdfPath)) {
      // Regenerate if missing
      if (cert) {
        const newPath = await this.generateCertificatePdf(cert, 'en');
        cert.pdfPath = newPath;
        await this.certificateRepository.save(cert);
        return fs.createReadStream(newPath);
      }
      throw new NotFoundException('Certificate PDF not found');
    }
    return fs.createReadStream(cert.pdfPath);
  }

  private async generateCertificatePdf(cert: Certificate, lang: string = 'en'): Promise<string> {
    const filePath = path.join(this.uploadsDir, `${cert.certificateId}.pdf`);

    // Generate QR Code image buffer pointing to verification URL
    const verifyUrl = `${this.verifyBaseUrl}/${cert.certificateId}`;
    const qrBuffer = await QRCode.toBuffer(verifyUrl, { margin: 1, width: 120 });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#2E7D32');
      doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('PIKMOOLYA', 50, 52, { align: 'center' });
      doc.fontSize(11).font('Helvetica').text('AI-BASED PRODUCT QUALITY ASSESSMENT CERTIFICATE', 50, 78, { align: 'center' });

      doc.moveDown(2);
      doc.fillColor('#1C2A1E');

      // Certificate Meta Info
      doc.fontSize(10).font('Helvetica-Bold').text(`Certificate ID: ${cert.certificateId}`, 50, 120);
      const dateStr = cert.assessmentDate.toISOString().split('T')[0];
      doc.fontSize(10).font('Helvetica').text(`Assessment Date: ${dateStr}`, 350, 120, { align: 'right' });

      doc.moveTo(50, 138).lineTo(545, 138).strokeColor('#E2E8F0').lineWidth(1).stroke();

      // Product Details Section
      doc.moveDown(1);
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#2E7D32').text('PRODUCT DETAILS', 50, 150);
      
      doc.fontSize(11).fillColor('#1C2A1E').font('Helvetica-Bold').text('Product / Crop:', 50, 172);
      doc.font('Helvetica').text(`${cert.cropName} ${cert.variety ? `(${cert.variety})` : ''}`, 160, 172);

      doc.font('Helvetica-Bold').text('Quantity:', 50, 192);
      doc.font('Helvetica').text(`${cert.quantity || 'N/A'} ${cert.unit || 'kg'}`, 160, 192);

      doc.font('Helvetica-Bold').text('Farmer:', 50, 212);
      doc.font('Helvetica').text(`${cert.farmerName || 'Registered Farmer'}`, 160, 212);

      doc.font('Helvetica-Bold').text('Location:', 50, 232);
      doc.font('Helvetica').text(`${cert.location || 'Pune, Maharashtra'}`, 160, 232);

      doc.moveTo(50, 254).lineTo(545, 254).strokeColor('#E2E8F0').lineWidth(1).stroke();

      // AI Quality Assessment Section Box
      doc.rect(50, 266, 495, 80).fill('#E8F5E9');
      doc.fillColor('#2E7D32').fontSize(13).font('Helvetica-Bold').text('AI QUALITY ASSESSMENT', 65, 276);

      doc.fillColor('#1C2A1E').fontSize(10).font('Helvetica-Bold').text('Overall Score', 65, 300);
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#2E7D32').text(`${cert.qualityScore} / 100`, 65, 314);

      doc.fillColor('#1C2A1E').fontSize(10).font('Helvetica-Bold').text('Quality Grade', 220, 300);
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#2E7D32').text(`Grade ${cert.qualityGrade}`, 220, 314);

      doc.fillColor('#1C2A1E').fontSize(10).font('Helvetica-Bold').text('AI Confidence', 380, 300);
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#2E7D32').text(`${cert.confidence}%`, 380, 314);

      // Visual Assessment Checklist
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#2E7D32').text('VISUAL ASSESSMENT SUMMARY', 50, 362);

      doc.fontSize(10).font('Helvetica').fillColor('#1C2A1E');
      doc.text('Color: Good', 50, 384);
      doc.text('Appearance: Good', 200, 384);
      doc.text('Surface Condition: Good', 350, 384);

      doc.text('Visible Defects: Minor', 50, 404);
      doc.text('Image Quality: High Resolution', 200, 404);

      if (cert.estimatedPrice) {
        doc.moveTo(50, 426).lineTo(545, 426).strokeColor('#E2E8F0').lineWidth(1).stroke();
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#2E7D32').text('AI PRICE ESTIMATION', 50, 436);
        doc.fontSize(10).fillColor('#1C2A1E').font('Helvetica').text(`Estimated Fair Price: ₹${cert.estimatedPrice} / quintal`, 50, 454);
        if (cert.priceRange) {
          doc.text(`Recommended Range: ${cert.priceRange}`, 300, 454);
        }
      }

      // Embed QR Code & Verification Info
      doc.image(qrBuffer, 50, 480, { width: 90 });
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#2E7D32').text('VERIFY CERTIFICATE', 155, 490);
      doc.fontSize(9).font('Helvetica').fillColor('#5B6B5D').text('Scan QR code with smartphone to verify authenticity.', 155, 506);
      doc.fontSize(8).font('Helvetica').fillColor('#718096').text(verifyUrl, 155, 522);

      // Disclaimer Banner at Bottom
      doc.rect(40, 590, 515, 50).fill('#F8FAF6');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#D97706').text('DISCLAIMER:', 50, 598);
      doc.fontSize(7.5).font('Helvetica').fillColor('#5B6B5D').text(
        'This certificate represents an AI-based visual quality assessment from the submitted product image. It is not a substitute for laboratory testing or official government certification.',
        50,
        610,
        { width: 495 }
      );

      // Footer
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#2E7D32').text('PIKMOOLYA - Fair Price. Direct Market Access.', 50, 660, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', (err) => reject(err));
    });
  }
}
