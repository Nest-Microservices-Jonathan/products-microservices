import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Product Service');

  onModuleInit() {
    this.$connect();
    this.logger.log("Database connected");
    
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll(paginationDto: PaginationDto) {

    const {page = 1, limit = 10} = paginationDto;

    const totalPages = await this.product.count({where: {available : true}}); 
    const lastPages = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        where: {available: true},
        skip: (page - 1) * limit,
        take: limit
      }),
      metadata: {
        page,
        totalPages,
        lastPages
      }
    }
    
  }

  async findOne(id: number) {

    const product = await this.product.findFirst({
      where: {id , available: true}
    })

    if (!product)
    {
      throw new NotFoundException(`Product with id ${ id} not found`);
    }

    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: {id},
      data: data
    })
  }

  async remove(id: number) {
    await this.findOne(id);

    // return this.product.delete({
    //   where: {id}
    // })

    const product = this.product.update({
      where: {id},
      data: {available: false}
    });

    return product;
  }
}
