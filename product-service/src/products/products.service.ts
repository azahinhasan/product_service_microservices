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

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto) {
    try {
      return await this.productModel.create({
        ...dto,
        createdBy: dto.createdBy,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll() {
    try {
      return await this.productModel.find();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.productModel.findById(id);
      if (!product) throw new NotFoundException('Product not found');
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  async update(dto: UpdateProductDto, userId: string) {
    try {
      const product = await this.productModel.findById(dto.id);
      if (!product) throw new NotFoundException('Product not found');
      if (product.createdBy.toString() !== userId)
        throw new ForbiddenException('Access denied');
      return await this.productModel.findByIdAndUpdate(dto.id, dto, {
        new: true,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      console.error(error);
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const product = await this.productModel.findById(id);
      if (!product) throw new NotFoundException('Product not found');
      if (product.createdBy.toString() !== userId)
        throw new ForbiddenException('Access denied');
      return await this.productModel.findByIdAndDelete(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      console.error(error);
      throw new InternalServerErrorException('Failed to delete product');
    }
  }
}
