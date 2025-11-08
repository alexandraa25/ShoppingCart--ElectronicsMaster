import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  product: any;
  productId: number = 0;
  selectedImage: string = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.productId = +idParam;
        this.loadProduct();
      }
    });
  }

  loadProduct(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: data => {
        this.product = data;
        if (this.product.images?.length > 0) {
          this.selectedImage = 'http://localhost:3000' + this.product.images[0].url;
        }
      },
      error: err => console.error("Eroare la încărcare produs:", err)
    });
  }

  changeImage(url: string) {
    this.selectedImage = 'http://localhost:3000' + url;
  }
}
