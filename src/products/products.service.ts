import {
  ConflictException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private sequence = 1;
  private products: Product[] = [];

  create(createProductDto: CreateProductDto): void {
    if (
      this.products.findIndex((value) => value.name === createProductDto.name) > -1
    ) {
      throw new ConflictException();
    }

    const product = new Product();
    product.id = this.sequence++;
    product.name = createProductDto.name;
    product.price = createProductDto.price;
    product.description = createProductDto.description;
    product.isUpdated = false;
    this.products.push(product);
  }

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product {
    const product = this.products.find((product) => product.id === id);

    if (product === undefined) {
      throw new NotFoundException();
    }

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto): Product {
    const product = this.findOne(id);

    if (product.isUpdated) {
      throw new MethodNotAllowedException();
    }

    if (
      this.products.findIndex((value) => value.name === updateProductDto.name) > -1
    ) {
      throw new ConflictException();
    }

    product.name = updateProductDto.name ?? product.name;
    product.price = updateProductDto.price ?? product.price;
    product.description = updateProductDto.description ?? product.description;
    product.isUpdated = true;
    return product;
  }

  remove(id: number): void {
    const product = this.findOne(id);
    this.products.indexOf(product) > -1 && this.products.splice(this.products.indexOf(product), 1);
  }
}
