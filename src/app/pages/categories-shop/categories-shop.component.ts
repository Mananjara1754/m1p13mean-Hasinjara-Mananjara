import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryShopService, CategoryShop } from '../../services/category-shop.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
    selector: 'app-categories-shop',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './categories-shop.component.html',
    styleUrl: './categories-shop.component.css'
})
export class CategoriesShopComponent implements OnInit {
    categories: CategoryShop[] = [];
    isLoading = false;
    showModal = false;
    isEditing = false;
    currentCategory: CategoryShop = {
        name: '',
        description: '',
        icon: ''
    };

    // Frontend Search and Pagination
    searchTerm = '';
    currentPage = 1;
    pageSize = 10;
    totalItems = 0;
    totalPages = 1;

    constructor(private categoryShopService: CategoryShopService) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories() {
        this.isLoading = true;
        this.categoryShopService.getCategoryShops().subscribe({
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

    get filteredCategories(): CategoryShop[] {
        const search = this.normalizeString(this.searchTerm);
        return this.categories.filter(c =>
            this.normalizeString(c.name).includes(search) ||
            this.normalizeString(c.description || '').includes(search)
        );
    }

    get paginatedCategories(): CategoryShop[] {
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
        this.currentCategory = { name: '', description: '', icon: '' };
        this.showModal = true;
    }

    openEditModal(category: CategoryShop) {
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
            this.categoryShopService.updateCategoryShop(this.currentCategory._id!, this.currentCategory).subscribe({
                next: () => {
                    this.loadCategories();
                    this.closeModal();
                },
                error: (err: any) => {
                    console.error('Error updating category', err);
                    alert(err.error?.message || 'Error updating category');
                }
            });
        } else {
            this.categoryShopService.createCategoryShop(this.currentCategory).subscribe({
                next: () => {
                    this.loadCategories();
                    this.closeModal();
                },
                error: (err: any) => {
                    console.error('Error creating category', err);
                    alert(err.error?.message || 'Error creating category');
                }
            });
        }
    }

    deleteCategory(id: string) {
        if (confirm('Are you sure you want to delete this shop category?')) {
            this.categoryShopService.deleteCategoryShop(id).subscribe({
                next: () => this.loadCategories(),
                error: (err: any) => {
                    console.error('Error deleting category', err);
                    alert(err.error?.message || 'Error deleting category');
                }
            });
        }
    }
}
