import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductListQuery, ProductListResponse } from './product.types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(query: ProductListQuery): Promise<ProductListResponse> {
    const skip = query.skip ?? 0;
    const limit = query.limit ?? 20;

    const qb = this.productRepo.createQueryBuilder('product');

    if (query.category) {
      qb.andWhere('product.category = :category', {
        category: query.category,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(product.title LIKE :search OR product.description LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.skip(skip).take(limit);

    const [products, total] = await qb.getManyAndCount();

    return { products, total, skip, limit };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['reviews', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async getCategories(): Promise<string[]> {
    const results = await this.productRepo
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .orderBy('product.category', 'ASC')
      .getRawMany<{ category: string }>();

    return results.map((r) => r.category);
  }
}
