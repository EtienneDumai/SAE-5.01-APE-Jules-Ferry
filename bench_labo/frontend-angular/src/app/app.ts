import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const API_URL = 'http://localhost:3003/api/products'; // ton backend front

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  title = 'Frontend Angular - Products';

  products: Product[] = [];
  filtered: Product[] = [];
  selected?: Product;
  query = '';
  loading = false;
  error = '';

  ngOnInit(): void {
    this.fetchProducts();
  }

  async fetchProducts() {
    this.loading = true;
    try {
      const res = await fetch(API_URL);
      this.products = await res.json();
      this.filtered = this.products;
    } catch (e) {
      console.error(e);
      this.error = 'Erreur de chargement';
    } finally {
      this.loading = false;
    }
  }

  onQueryChange(value: string) {
    this.query = value;
    const q = value.toLowerCase();
    this.filtered = this.products.filter((p) =>
      p.name.toLowerCase().includes(q)
    );
  }

  selectProduct(p: Product) {
    this.selected = p;
  }
}
