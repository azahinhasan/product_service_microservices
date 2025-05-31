import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logging, LoggingDocument } from './logging.schema';

@Injectable()
export class LoggingsService {
  constructor(
    @InjectModel(Logging.name) private loggingModel: Model<LoggingDocument>,
  ) {}

  async create(userId: string, requestType: string, status: string) {
    return this.loggingModel.create({
      userId,
      requestType,
      status,
    });
  }

  async findAll() {
    try {
      return await this.loggingModel.find().populate('userId', 'email');
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch loggings');
    }
  }

  async findByUser(userId: string) {
    try {
      const loggings = await this.loggingModel.find({ userId });
      if (!loggings.length)
        throw new NotFoundException('No loggings found for user');
      return loggings;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch loggings');
    }
  }
}
