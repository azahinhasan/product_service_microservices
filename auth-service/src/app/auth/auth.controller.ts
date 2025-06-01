import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SignupDto,
  VerifyTokenDto,
  SigninDto,
} from './auth.dto';
import { MessagePattern } from '@nestjs/microservices';
import { RefreshTokenGuard } from '../../guard/jwt-refresh-token.guard';
import { GetIssuer } from '../../decorators/get-issuer.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('signout')
  signout(@GetIssuer() issuer: any) {
    return this.authService.signout(issuer.user.id);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refresh(
    @GetIssuer() issuer: any,
    @Headers('x-refresh-token') refreshTokenHeader: string,
  ) {
    return this.authService.refresh(refreshTokenHeader, issuer.user);
  }

  @MessagePattern('auth.token.validate')
  verifyToken(@Body() dto: VerifyTokenDto) {
    return this.authService.verifyToken(dto);
  }
}
