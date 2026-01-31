import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ShopService, Shop } from '../../services/shop.service';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop-list.component.html',
  styleUrl: './shop-list.component.css'
})
export class ShopListComponent implements OnInit {
  shops$!: Observable<Shop[]>;

  constructor(private shopService: ShopService) { }

  ngOnInit() {
    this.shops$ = this.shopService.getShops();
  }
}
