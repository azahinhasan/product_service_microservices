import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './product.schema';
import { ProductsController } from './products.controller';
import { AuthClientModule } from '../modules/auth-client.module';
import { LoggingModule } from 'src/logging/logging.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    AuthClientModule,
    LoggingModule, 
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}