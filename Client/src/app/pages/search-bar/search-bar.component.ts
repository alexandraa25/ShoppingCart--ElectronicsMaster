import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  searchText = signal('');
  selectedCategory = signal('');

  categories = [
    'Auto, moto si ambarcatiuni',
    'Imobiliare',
    'Locuri de munca',
    'Electronice si electrocasnice',
    'Moda si frumusete',
    'Piese auto',
    'Casa si gradina',
    'Mama si copilul',
    'Sport, timp liber, arta'
  ];

  @Output() searchEvent = new EventEmitter<{ text: string, category: string }>();

  applyFilters() {
    this.searchEvent.emit({ 
      text: this.searchText(), 
      category: this.selectedCategory() 
    });
  }
}
