import { Exclude } from 'class-transformer';

export class Product {
  id: number;
  name: string;
  price: number;
  description: string;

  @Exclude()
  isUpdated: boolean;
}
