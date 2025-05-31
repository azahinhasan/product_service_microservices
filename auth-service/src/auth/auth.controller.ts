import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto,VerifyTokenDto,RefreshDto ,SigninDto,SignoutDto} from './auth.dto';
import { MessagePattern } from '@nestjs/microservices';


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

  @Post('signout')
  signout(@Body() body: SignoutDto) {
    return this.authService.signout(body);
  }

  @Post('refresh')
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body);
  }

  @MessagePattern('auth.token.validate')
  verifyToken(@Body() dto:VerifyTokenDto) {
    return this.authService.verifyToken(dto);
  }
}