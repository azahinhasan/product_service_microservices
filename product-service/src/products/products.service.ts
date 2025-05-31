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
import { LoggingsService } from '../logging/logging.service';
import { PaginationDto } from 'src/common/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly logsService: LoggingsService,
  ) {}

  async create(dto: CreateProductDto) {
    try {
      const product = await this.productModel.create({
        ...dto,
        createdBy: dto.createdBy,
      });

      await this.logsService.create(
        dto.createdBy.toString(),
        'CREATE_PRODUCT',
        'SUCCESS',
      );

      return product;
    } catch (error) {
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

      const products = await this.productModel
        .find()
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await this.productModel.countDocuments();
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
    try {
      const product = await this.productModel.findById(id);
      if (!product) throw new NotFoundException('Product not found');

      await this.logsService.create(userId, 'GET_PRODUCT_BY_ID', 'SUCCESS');

      return product;
    } catch (error) {
      await this.logsService.create(userId, 'GET_PRODUCT_BY_ID', 'FAILED');
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  async update(dto: UpdateProductDto, userId: string) {
    try {
      const product = await this.productModel.findById(dto.id);
      if (!product) throw new NotFoundException('Product not found');
      if (product.createdBy.toString() !== userId) {
        await this.logsService.create(userId, 'DELETE_PRODUCT', 'FAILED');
        throw new ForbiddenException('Access denied');
      }

      const updated = await this.productModel.findByIdAndUpdate(dto.id, dto, {
        new: true,
      });

      await this.logsService.create(userId, 'UPDATE_PRODUCT', 'SUCCESS');

      return updated;
    } catch (error) {
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
    try {
      const product = await this.productModel.findById(id);
      if (!product) throw new NotFoundException('Product not found');
      if (product.createdBy.toString() !== userId) {
        await this.logsService.create(userId, 'DELETE_PRODUCT', 'FAILED');
        throw new ForbiddenException('Access denied');
      }

      const deleted = await this.productModel.findByIdAndDelete(id);

      await this.logsService.create(userId, 'DELETE_PRODUCT', 'SUCCESS');

      return deleted;
    } catch (error) {
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
