import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
  User,
  UserRole,
  UserStatus,
} from '../users/entities/user.entity.js';

import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { phone, email, password, role, preferredLanguage } =
      registerDto;

    if (phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone },
      });

      if (existingPhone) {
        throw new ConflictException(
          'An account with this phone number already exists',
        );
      }
    }

    if (email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email },
      });

      if (existingEmail) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      phone: phone ?? null,
      email: email ?? null,
      passwordHash,
      role: role as UserRole,
      status: UserStatus.ACTIVE,
      preferredLanguage: preferredLanguage ?? 'en',
    });

    const savedUser = await this.userRepository.save(user);

    const accessToken = await this.jwtService.signAsync({
      sub: savedUser.id,
      role: savedUser.role,
    });

    return {
      message: 'Registration successful',
      accessToken,
      user: {
        id: savedUser.id,
        phone: savedUser.phone,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        preferredLanguage: savedUser.preferredLanguage,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { phone, email, password } = loginDto;

    let user: User | null = null;

    if (phone) {
      user = await this.userRepository.findOne({
        where: { phone },
      });
    } else if (email) {
      user = await this.userRepository.findOne({
        where: { email },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid phone/email or password');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash ?? '',
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid phone/email or password');
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.BLOCKED
    ) {
      throw new UnauthorizedException(
        'Your account is currently unavailable',
      );
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
        preferredLanguage: user.preferredLanguage,
      },
    };
  }
}