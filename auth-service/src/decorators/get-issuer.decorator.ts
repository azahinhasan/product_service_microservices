import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetIssuer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    return request; // or request.user
  },
);
