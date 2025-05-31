import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers['authorization']?.split(' ')[1];
    const refreshToken = request.headers['x-refresh-token'];

    if (!token || !refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const decoded = await firstValueFrom(
        this.authClient.send('auth.token.validate', { token }),
      );
      request.user = decoded.payload
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
