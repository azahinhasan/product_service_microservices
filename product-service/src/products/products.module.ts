import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './product.schema';
import { ProductsController } from './products.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthClientModule } from '../modules/auth-client.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_REFRESH_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    AuthClientModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
