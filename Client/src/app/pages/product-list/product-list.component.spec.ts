import { ComponentFixture, TestBed } from '@angular/core/testing';

import { productListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  let component: productListComponent;
  let fixture: ComponentFixture<productListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [productListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(productListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
