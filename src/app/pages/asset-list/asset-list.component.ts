import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '@components/card/card.component';
import { ButtonComponent } from '@components/button/button.component';
import { LucideAngularModule, Search, Filter, Edit, Trash2, Eye, Plus } from 'lucide-angular';

interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  assignedTo?: string;
  purchaseDate: string;
}

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, LucideAngularModule],
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css']
})
export class AssetListComponent implements OnInit {
  readonly Search = Search;
  readonly Filter = Filter;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Eye = Eye;
  readonly Plus = Plus;

  assets: Asset[] = [
    {
      id: 'AST-001',
      name: 'Dell Laptop XPS 13',
      category: 'Laptop',
      serialNumber: 'DLXPS13001',
      location: 'Office A',
      status: 'active',
      assignedTo: 'John Doe',
      purchaseDate: '2023-01-15'
    },
    {
      id: 'AST-002',
      name: 'HP Monitor 24"',
      category: 'Monitor',
      serialNumber: 'HPM24002',
      location: 'Office B',
      status: 'active',
      assignedTo: 'Jane Smith',
      purchaseDate: '2023-02-20'
    },
    {
      id: 'AST-003',
      name: 'Canon Printer',
      category: 'Printer',
      serialNumber: 'CPR003',
      location: 'Office A',
      status: 'maintenance',
      purchaseDate: '2022-11-10'
    }
  ];

  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';

  categories = ['All', 'Laptop', 'Desktop', 'Monitor', 'Printer', 'Phone', 'Tablet'];
  statuses = ['All', 'Active', 'Inactive', 'Maintenance', 'Retired'];

  ngOnInit(): void {
    console.log('Asset List component initialized');
  }

  get filteredAssets(): Asset[] {
    return this.assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           asset.serialNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           asset.assignedTo?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'All' || asset.category === this.selectedCategory;
      const matchesStatus = this.selectedStatus === 'All' || asset.status === this.selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  onEdit(assetId: string): void {
    console.log('Editing asset:', assetId);
  }

  onDelete(assetId: string): void {
    console.log('Deleting asset:', assetId);
  }

  onView(assetId: string): void {
    console.log('Viewing asset:', assetId);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-[var(--color-success)]';
      case 'inactive': return 'bg-[var(--color-text-muted)]';
      case 'maintenance': return 'bg-[var(--color-warning)]';
      case 'retired': return 'bg-[var(--color-error)]';
      default: return 'bg-[var(--color-text-muted)]';
    }
  }
}
