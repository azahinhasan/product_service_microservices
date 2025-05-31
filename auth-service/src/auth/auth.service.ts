import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import {
  SignupDto,
  VerifyTokenDto,
  RefreshDto,
  SigninDto,
  SignoutDto,
} from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    try {
      const hashed = await bcrypt.hash(dto.password, 10);
      await this.usersService.create({
        name: dto.name,
        email: dto.email,
        password: hashed,
      });

      return {
        status: 200,
        message: 'SignUp successful',
        name: dto.name,
        email: dto.email,
      };
    } catch (error) {
      console.log(error);
      if (error.code === 11000 || error.message?.includes('duplicate key')) {
        throw new ConflictException('Email already in use');
      }
      throw new InternalServerErrorException('Failed to sign up');
    }
  }

  async signin(dto: SigninDto) {
    try {
      const user = await this.usersService.findByEmail(dto.email);
      if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const accessToken = this.jwtService.sign(
        { sub: user._id, role: user.role },
        { expiresIn: '15m' },
      );
      const refreshToken = this.jwtService.sign(
        { sub: user._id },
        { expiresIn: '7d' },
      );

      await this.tokensService.store(user._id as string, refreshToken);

      return {
        status: 200,
        message: 'Login successful',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log(error);

      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Failed to sign in');
    }
  }

  async signout(dto: SignoutDto) {
    try {
      return await this.tokensService.delete(dto.userId);
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException('Failed to sign out');
    }
  }

  async refresh(dto: RefreshDto) {
    try {
      const stored = await this.tokensService.find(
        dto.userId,
        dto.refreshToken,
      );
      if (!stored) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        { sub: dto.userId },
        { expiresIn: '15m' },
      );
      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }

  async verifyToken(dto: VerifyTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token);
      return { valid: true, payload };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
