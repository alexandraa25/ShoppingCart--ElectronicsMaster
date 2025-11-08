import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../services/category-service';
import { ProductService } from '../services/product.service';
import { CommonModule } from '@angular/common';
import { PopupMessageComponent } from '../popup-message/popup-message.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupMessageComponent],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {

  productForm!: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  popupVisible = false;
  popupMessage = '';
  popupTitle = '';
  isEditMode: boolean = false;
  popupIsError = false;
  existingImages: string[] = [];

  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', Validators.maxLength(500)],
      price: [null, [Validators.required, Validators.min(0.1)]],
      stock: [1, [Validators.required, Validators.min(1)]],
      categoryId: [null, Validators.required],
      images: [[]]
    });

    this.loadCategories();
    const productId = this.route.snapshot.queryParamMap.get('id');
    if (productId) {
      this.isEditMode = true;
      this.loadProductData(Number(productId));
    }
  }

loadProductData(id: number): void {
  this.productService.getProductById(id).subscribe({
    next: (product: Product) => {

      this.productForm.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId
      });

         this.existingImages = product.images.map(img => `http://localhost:3000${img.url}`);
      // ✅ imaginile vin tipate corect
     this.imagePreviews = product.images.map(img =>
  `http://localhost:3000${img.url}`
);
    },
    error: () => {
      this.showPopup('Eroare', 'Nu am putut încărca produsul pentru editare.', true);
    }
  });
}
  showPopup(title: string, message: string, isError: boolean): void {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupIsError = isError;
    this.popupVisible = true;
  }

  closePopup(): void {
    this.popupVisible = false;
  }

  // ✅ Selectarea imaginilor
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    for (const file of files) {
      if (this.imagePreviews.length >= 3) {
        this.showPopup("Limită imagini", "Poți încărca maxim 3 imagini.", true);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
        this.selectedFiles.push(file);
      };
      reader.readAsDataURL(file);
    }
  }

 removeImage(index: number): void {
  const removedImage = this.imagePreviews[index];

  // Dacă imaginea era în lista originală → o scoatem de acolo
  this.existingImages = this.existingImages.filter(img => img !== removedImage);

  // Scoatem și din preview
  this.imagePreviews.splice(index, 1);

  // Dacă era și fișier încărcat nou → îl scoatem din selectedFiles
  this.selectedFiles.splice(index, 1);
}

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        console.log('Categor ' + JSON.stringify(data));
        this.categories = Array.isArray(data) ? data : data?.$values ?? [];
      },
      error: () => {
        this.categories = [];
        this.showPopup('Eroare', 'Nu s-au putut încărca categoriile.', true);
      }
    });
  }
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.showPopup('Eroare', 'Te rugăm completează toate câmpurile obligatorii.', true);
      return;
    }

    const formData = new FormData();

    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('stock', this.productForm.get('stock')?.value);
    formData.append('categoryId', this.productForm.get('categoryId')?.value);

    for (const file of this.selectedFiles) {
      formData.append('images', file);
    }

    if (this.isEditMode) {
      const productId = Number(this.route.snapshot.queryParamMap.get('id'));
      formData.append('existingImages', JSON.stringify(
    this.existingImages.map(img => img.replace('http://localhost:3000', ''))
  ));
      this.productService.updateProduct(productId, formData).subscribe({
        next: () => {
          this.showPopup('Succes', 'Produsul a fost actualizat!', false);
        },
        error: () => {
          this.showPopup('Eroare', 'Actualizarea produsului a eșuat.', true);
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.showPopup('Succes', 'Produsul a fost adăugat cu succes!', false);
          this.productForm.reset();
          this.selectedFiles = [];
          this.imagePreviews = [];
        },
        error: () => {
          this.showPopup('Eroare', 'A apărut o problemă la salvarea produsului.', true);
        }
      });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
