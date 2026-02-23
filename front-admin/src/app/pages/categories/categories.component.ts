import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  isLoading = false;
  showModal = false;
  isEditing = false;
  currentCategory: Category = {
    _id: '',
    name: '',
    description: '',
    slug: ''
  };

  // Frontend Search and Pagination
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.isLoading = false;
      }
    });
  }

  get filteredCategories(): Category[] {
    const search = this.normalizeString(this.searchTerm);
    return this.categories.filter(c =>
      this.normalizeString(c.name).includes(search) ||
      this.normalizeString(c.description || '').includes(search)
    );
  }

  get paginatedCategories(): Category[] {
    const items = this.filteredCategories;
    this.totalItems = items.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  }

  updatePagination() {
    const items = this.filteredCategories;
    this.totalItems = items.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  onSearchChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "");
  }

  openAddModal() {
    this.isEditing = false;
    this.currentCategory = { _id: '', name: '', description: '', slug: '' };
    this.showModal = true;
  }

  openEditModal(category: Category) {
    this.isEditing = true;
    this.currentCategory = { ...category };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategory() {
    if (!this.currentCategory.name) return;

    if (this.isEditing && this.currentCategory._id) {
      this.categoryService.updateCategory(this.currentCategory._id!, this.currentCategory).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err: any) => console.error('Error updating category', err)
      });
    } else {
      this.categoryService.createCategory(this.currentCategory).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err: any) => console.error('Error creating category', err)
      });
    }
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
        error: (err: any) => console.error('Error deleting category', err)
      });
    }
  }
}
