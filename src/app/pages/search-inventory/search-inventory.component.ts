import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '@components/card/card.component';
import { ButtonComponent } from '@components/button/button.component';
import { LucideAngularModule, Search, MapPin, Package, AlertCircle } from 'lucide-angular';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: string;
}

@Component({
  selector: 'app-search-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, LucideAngularModule],
  templateUrl: './search-inventory.component.html',
  styleUrls: ['./search-inventory.component.css']
})
export class SearchInventoryComponent implements OnInit {
  readonly Search = Search;
  readonly MapPin = MapPin;
  readonly Package = Package;
  readonly AlertCircle = AlertCircle;

  inventoryItems: InventoryItem[] = [
    {
      id: 'INV-001',
      name: 'Laptop Charger',
      category: 'Accessories',
      quantity: 15,
      location: 'Warehouse A',
      status: 'in-stock',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'INV-002',
      name: 'USB Cable',
      category: 'Accessories',
      quantity: 3,
      location: 'Office B',
      status: 'low-stock',
      lastUpdated: '2024-01-14'
    },
    {
      id: 'INV-003',
      name: 'Wireless Mouse',
      category: 'Accessories',
      quantity: 0,
      location: 'Warehouse A',
      status: 'out-of-stock',
      lastUpdated: '2024-01-13'
    }
  ];

  searchTerm = '';
  selectedCategory = '';
  selectedLocation = '';

  categories = ['All', 'Accessories', 'Hardware', 'Software', 'Consumables'];
  locations = ['All', 'Warehouse A', 'Warehouse B', 'Office A', 'Office B'];

  ngOnInit(): void {
    console.log('Search Inventory component initialized');
  }

  get filteredItems(): InventoryItem[] {
    return this.inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           item.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'All' || item.category === this.selectedCategory;
      const matchesLocation = this.selectedLocation === 'All' || item.location === this.selectedLocation;

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'in-stock': return 'text-[var(--color-success)]';
      case 'low-stock': return 'text-[var(--color-warning)]';
      case 'out-of-stock': return 'text-[var(--color-error)]';
      default: return 'text-[var(--color-text-muted)]';
    }
  }

  getStatusIcon(status: string): any {
    switch (status) {
      case 'in-stock': return Package;
      case 'low-stock': return AlertCircle;
      case 'out-of-stock': return AlertCircle;
      default: return Package;
    }
  }

  onSearch(): void {
    // TODO: Implement search functionality
  }

  getStatusDisplay(status: string): string {
    return status.replace('-', ' ');
  }

  getLowStockCount(): number {
    return this.inventoryItems.filter(i => i.status === 'low-stock').length;
  }

  getOutOfStockCount(): number {
    return this.inventoryItems.filter(i => i.status === 'out-of-stock').length;
  }
}
