// ---------------------- src/auth/auth.module.ts ----------------------
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.schema';
import { Token, TokenSchema } from '../tokens/token.schema';
import { UserClientModule } from 'src/modules/auth-client.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_REFRESH_SECRET||"datadata",
      signOptions: { expiresIn: '15m' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    UserClientModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, TokensService],
})
export class AuthModule {}
