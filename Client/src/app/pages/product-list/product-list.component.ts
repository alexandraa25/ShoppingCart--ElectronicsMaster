import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../services/category-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PopupMessageComponent } from '../popup-message/popup-message.component';

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  datePosted?: string | null;
  imageUrl?: string;
}

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PopupMessageComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class productListComponent implements OnInit {
  products: Product[] = [];            
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  sortByControl = new FormControl('newest');
  filteredproducts: Product[] = [];
  itemsPerPage = 20;
  currentPage = 1;
  paginatedproducts: Product[] = [];   
  categories: Category[] = [];

  userId: string | null = null;
  isAdmin: boolean = false;
  popupVisible = false;
popupTitle = '';
popupMessage = '';
popupIsError = false;
popupConfirmMode = false;
productToDelete: number | null = null;



  constructor(private ProductService: ProductService, private categoryService: CategoryService, private router: Router, private route: ActivatedRoute,private authService: AuthService) { }

  ngOnInit(): void {
  this.loadproducts();
  this.loadCategories();

  this.searchControl.valueChanges.subscribe(() => this.applyFilters());
  this.categoryControl.valueChanges.subscribe(() => this.applyFilters());
  this.sortByControl.valueChanges.subscribe(() => this.applyFilters());

  this.authService.user$.subscribe(user => {
    this.userId = user?.sub || null;
    this.isAdmin = this.authService.userRole === 'Admin'; 
  });
}

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        console.log('Categorii încărcate:', data);
        this.categories = Array.isArray(data) ? data : data?.$values ?? [];
      },
      error: (err) => {
        console.error('Eroare la încărcarea categoriilor:', err);
        this.categories = [];
      }
    });
  }

loadproducts(): void {
  this.ProductService.getProducts().subscribe({
    next: (data: any[]) => {
      
      this.products = data.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        categoryId: p.categoryId,
        datePosted: p.createdAt ?? null,
        imageUrl: p.imageUrl || 'https://via.placeholder.com/300x200'
      }));

      this.filteredproducts = [...this.products];
      this.paginate();
    },
    error: (err) => console.error("Eroare la obținerea produselor:", err)
  });
}


  applyFilters(): void {
  const searchTerm = this.searchControl.value?.toLowerCase() ?? '';
  const category = this.categoryControl.value ?? '';
  const sortBy = this.sortByControl.value ?? 'newest';

  let filtered = this.products.filter(p =>
    p.name.toLowerCase().includes(searchTerm) &&
    (!category || p.categoryId === +category)
  );

  if (sortBy === 'newest') {
    filtered.sort((a, b) =>
      new Date(b.datePosted ?? 0).getTime() - new Date(a.datePosted ?? 0).getTime()
    );
  } else {
    filtered.sort((a, b) =>
      new Date(a.datePosted ?? 0).getTime() - new Date(b.datePosted ?? 0).getTime()
    );
  }

  this.filteredproducts = filtered;
  this.currentPage = 1;
  this.paginate();
}

  get totalPages(): number {
    return Math.ceil(this.filteredproducts.length / this.itemsPerPage);
  }

  paginate(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedproducts = this.filteredproducts.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }

editProduct(id: number) {
  this.router.navigate(['/product-form'], { queryParams: { id } });
}
  viewproduct(id: number) {
  this.router.navigate(['/product-detail'], { queryParams: { id } });
}
  

confirmDeleteProduct(id: number): void {
  this.productToDelete = id;
  this.popupTitle = "Confirmare ștergere";
  this.popupMessage = "Ești sigur că vrei să muți produsul în arhivă?";
  this.popupIsError = false;
  this.popupConfirmMode = true; 
  this.popupVisible = true;
}

deleteProductConfirmed(): void {
  if (!this.productToDelete) return;

  this.ProductService.deleteProduct(this.productToDelete).subscribe({
    next: () => {
      this.products = this.products.filter(p => p.id !== this.productToDelete);
      this.applyFilters();
      this.closePopup(); // IMPORTANT
      this.showPopup("Succes", "Produs mutat în arhivă cu succes!", false);
    },
    error: () => {
      this.closePopup();
      this.showPopup("Eroare", "Nu am putut muta produsul în arhivă.", true);
    }
  });
}

showPopup(title: string, message: string, confirmMode = false) {
  this.popupTitle = title;
  this.popupMessage = message;
  this.popupIsError = confirmMode ? false : this.popupIsError;
  this.popupConfirmMode = confirmMode;
  this.popupVisible = true;
}
closePopup(): void {
  this.popupVisible = false;
  this.popupConfirmMode = false; 
  this.productToDelete = null;   
}

}
