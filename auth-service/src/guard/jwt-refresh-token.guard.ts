import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  private readonly refreshSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.headers['x-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshSecret,
      });
      
      request.user = decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}
