import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('products')
  getProducts() {
    return this.productService.getAllProducts();
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
  @UseInterceptors(FilesInterceptor('images', 2))
  createProduct(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.createProduct(
      dto.title,
      dto.description || '',
      dto.affiliateUrl,
      files,
    );
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
  @UseInterceptors(FilesInterceptor('images', 2))
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: { title?: string; description?: string; affiliateUrl?: string; targetImageIndex?: string },
  ) {
    return this.productService.updateProduct(
      id,
      body.title,
      body.description,
      body.affiliateUrl,
      files,
      body.targetImageIndex,
    );
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteProduct(id);
  }
}
