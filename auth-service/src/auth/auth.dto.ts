import { IsEmail, IsNotEmpty, MinLength,IsMongoId } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

export class SignoutDto {
  @IsMongoId()
  userId: string;
}

export class RefreshDto {
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  refreshToken: string;
}

export class VerifyTokenDto {
  @IsNotEmpty()
  token: string;
}
