import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { LoggingsService } from '../../logging/logging.service';
import { PaginationDto } from 'src/common/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly logsService: LoggingsService,
  ) {}

  async create(dto: CreateProductDto) {
    const session = await this.productModel.db.startSession();
    session.startTransaction();
    try {
      const product = await this.productModel.create(
        [
          {
            ...dto,
            createdBy: dto.createdBy,
          },
        ],
        { session },
      );

      await this.logsService.create(
        dto.createdBy.toString(),
        'CREATE_PRODUCT',
        'SUCCESS',
        session,
      );

      await session.commitTransaction();
      session.endSession();

      return product[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error(error);
      await this.logsService.create(
        dto.createdBy.toString(),
        'CREATE_PRODUCT',
        'FAILED',
      );
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll(pagination: PaginationDto) {
    try {
      const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
      const limit =
        pagination.limit && pagination.limit > 0 ? pagination.limit : 10;
      const skip = (page - 1) * limit;

      const session = await this.productModel.db.startSession();
      session.startTransaction();

      const products = await this.productModel
        .find()
        .skip(skip)
        .limit(limit)
        .session(session)
        .exec();

      const total = await this.productModel.countDocuments().session(session);

      await session.commitTransaction();
      session.endSession();

      return {
        data: products,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async findOne(id: string, userId: string) {
    const session = await this.productModel.db.startSession();
    session.startTransaction();
    try {
      const product = await this.productModel.findById(id).session(session);
      if (!product) throw new NotFoundException('Product not found');

      await this.logsService.create(
        userId,
        'GET_PRODUCT_BY_ID',
        'SUCCESS',
        session,
      );

      await session.commitTransaction();
      session.endSession();

      return product;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      await this.logsService.create(userId, 'GET_PRODUCT_BY_ID', 'FAILED');
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  async update(dto: UpdateProductDto, userId: string) {
    const session = await this.productModel.db.startSession();
    session.startTransaction();
    try {
      const product = await this.productModel.findById(dto.id).session(session);
      if (!product) throw new NotFoundException('Product not found');
      if (product.createdBy.toString() !== userId) {
        await this.logsService.create(
          userId,
          'UPDATE_PRODUCT',
          'FAILED',
          session,
        );
        throw new ForbiddenException('Access denied');
      }

      const updated = await this.productModel
        .findByIdAndUpdate(dto.id, dto, { new: true, session })
        .exec();

      await this.logsService.create(
        userId,
        'UPDATE_PRODUCT',
        'SUCCESS',
        session,
      );

      await session.commitTransaction();
      session.endSession();

      return updated;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;

      await this.logsService.create(userId, 'UPDATE_PRODUCT', 'FAILED');
      console.error(error);
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async remove(id: string, userId: string) {
    const session = await this.productModel.db.startSession();
    session.startTransaction();
    try {
      const product = await this.productModel.findById(id).session(session);
      if (!product) throw new NotFoundException('Product not found');
      if (product.createdBy.toString() !== userId) {
        await this.logsService.create(
          userId,
          'DELETE_PRODUCT',
          'FAILED',
          session,
        );
        throw new ForbiddenException('Access denied');
      }

      const deleted = await this.productModel
        .findByIdAndDelete(id, { session })
        .exec();

      await this.logsService.create(
        userId,
        'DELETE_PRODUCT',
        'SUCCESS',
        session,
      );

      await session.commitTransaction();
      session.endSession();

      return deleted;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;

      await this.logsService.create(userId, 'DELETE_PRODUCT', 'FAILED');
      console.error(error);
      throw new InternalServerErrorException('Failed to delete product');
    }
  }
}
