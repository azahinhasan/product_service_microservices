import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
  Inject,
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
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
    private jwtService: JwtService,
    @Inject('USER_SERVICE') private client: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
  }

  async signup(dto: SignupDto) {
    try {
      const hashed = await bcrypt.hash(dto.password, 10);
      const user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        password: hashed,
      });

      this.client.emit('user.created', {
        id: user._id,
        email: user.email,
        name: user.name,
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
        { id: user._id, role: user.role },
        { secret: this.accessSecret, expiresIn: '15m' },
      );
      const refreshToken = this.jwtService.sign(
        { id: user._id },
        { secret: this.refreshSecret, expiresIn: '7d' },
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
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET');

      await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: refreshSecret,
      });

      const accessToken = this.jwtService.sign(
        { id: dto.userId },
        { secret: this.accessSecret, expiresIn: '15m' },
      );

      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }
  async verifyToken(dto: VerifyTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token, {
        secret: this.accessSecret,
      });

      return { valid: true, payload };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
