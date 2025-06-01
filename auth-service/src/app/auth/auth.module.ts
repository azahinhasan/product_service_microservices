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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    UserClientModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, TokensService],
})
export class AuthModule {}
