import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryShopService, CategoryShop } from '../../services/category-shop.service';

@Component({
    selector: 'app-categories-shop',
    standalone: true,
    imports: [CommonModule, FormsModule],
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

    constructor(private categoryShopService: CategoryShopService) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories() {
        this.isLoading = true;
        this.categoryShopService.getCategoryShops().subscribe({
            next: (data) => {
                this.categories = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading categories', err);
                this.isLoading = false;
            }
        });
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
