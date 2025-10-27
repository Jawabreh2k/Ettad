import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
// import { StorageService } from '../../core/services/storage.service';
// import { STORAGE_KEYS } from '../../core/constants/app.constants';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  isSidebarCollapsed = false;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check authentication on app load
    this.checkAuthentication();
  }

  onSidebarToggle(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }

  private checkAuthentication(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/auth/login']);
    }
  }
}

