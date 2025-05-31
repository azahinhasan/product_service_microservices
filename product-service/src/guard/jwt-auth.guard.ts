import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    return true;

    // const req = context.switchToHttp().getRequest<Request>();
    // const authHeader = req.headers['authorization'];
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   throw new UnauthorizedException('No token provided');
    // }
    // const token = authHeader.split(' ')[1];
    // try {
    //   const payload = this.jwtService.verify(token);
    //   req.user = payload;
    //   return true;
    // } catch {
    //   throw new UnauthorizedException('Invalid token');
    // }
  }
}
