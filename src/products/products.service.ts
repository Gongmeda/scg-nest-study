import {
  ConflictException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const foundProduct = await this.productsRepository.findOneBy({
      name: createProductDto.name,
    });

    if (foundProduct) {
      throw new ConflictException();
    }

    const product = new Product();
    product.name = createProductDto.name;
    product.price = createProductDto.price;
    product.description = createProductDto.description;
    product.isUpdated = false;
    await this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id: id });

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (product.isUpdated) {
      throw new MethodNotAllowedException();
    }

    if (updateProductDto.name) {
      const foundProduct = await this.productsRepository.findOneBy({
        name: updateProductDto.name,
      });

      if (foundProduct) {
        throw new ConflictException();
      }
    }

    product.name = updateProductDto.name ?? product.name;
    product.price = updateProductDto.price ?? product.price;
    product.description = updateProductDto.description ?? product.description;
    product.isUpdated = true;
    await this.productsRepository.save(product);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
