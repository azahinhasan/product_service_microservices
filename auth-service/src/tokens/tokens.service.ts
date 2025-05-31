import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Token, TokenDocument } from './token.schema';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async store(userId: string, token: string) {
    await this.tokenModel.findOneAndDelete({ user: userId });
    return this.tokenModel.create({ user: userId, refreshToken: token });
  }

  async find(userId: string, token: string) {
    return this.tokenModel.findOne({
      user: new Types.ObjectId(userId),
      refreshToken: token,
    });
  }

  async findByUserId(userId: string) {
    return this.tokenModel.findOne({ user: new Types.ObjectId(userId) });
  }

  async delete(userId: string) {
    return this.tokenModel.deleteOne({ user: new Types.ObjectId(userId) });
  }
}
