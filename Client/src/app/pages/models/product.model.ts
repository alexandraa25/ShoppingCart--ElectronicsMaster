import { ProductImage } from "./product-image.model";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
  images: ProductImage[];
}