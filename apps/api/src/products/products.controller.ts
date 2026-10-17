import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProductsService } from './products.service.js';
import { QueryProductsDto } from './dto/query-products.dto.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List and search products with filters and pagination' })
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAllProducts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOneProduct(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new agricultural product (Farmers only)' })
  async create(@Req() req: any, @Body() body: any) {
    return this.productsService.createProduct(req.user.userId, body);
  }
}
