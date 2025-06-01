import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './app/products/products.module';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'configs/.env.development',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      bufferCommands: false,
    }),
    ProductsModule,
    LoggingModule,
  ],
  // controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
