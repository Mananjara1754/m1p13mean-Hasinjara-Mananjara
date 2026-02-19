import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ShopStatisticService } from '../../services/shop-statistic.service';
import { AuthService } from '../../services/auth.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface LegendItem {
    label: string;
    value: number;
    percent: string;
    color: string;
}

@Component({
    selector: 'app-dashboard-shop',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './dashboard-shop.component.html',
    styleUrl: './dashboard-shop.component.css'
})
export class DashboardShopComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('productCountChart') productCountCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('productAmountChart') productAmountCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('catCountDoughnut') catCountCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('catAmountDoughnut') catAmountCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('promoCountDoughnut') promoCountCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('promoAmountDoughnut') promoAmountCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('orderCountLineChart') orderCountLineCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('orderAmountLineChart') orderAmountLineCanvas!: ElementRef<HTMLCanvasElement>;

    shopId: string = '';

    // ── Year filter ────────────────────────────────────────────
    selectedYear: number = new Date().getFullYear();
    availableYears: number[] = [];

    // ── Global Stats ──────────────────────────────────────────
    globalStats: any = null;
    globalLoading = false;
    globalError = '';

    // ── Products ──────────────────────────────────────────────
    productCountChart: Chart | null = null;
    productAmountChartRef: Chart | null = null;
    productsLoading = false;

    // ── Categories ────────────────────────────────────────────
    catCountChartRef: Chart | null = null;
    catAmountChartRef: Chart | null = null;
    categoriesLoading = false;
    catCountLegend: LegendItem[] = [];
    catAmountLegend: LegendItem[] = [];

    // ── Promos ────────────────────────────────────────────────
    promoCountChartRef: Chart | null = null;
    promoAmountChartRef: Chart | null = null;
    promosLoading = false;
    promoCountLegend: LegendItem[] = [];
    promoAmountLegend: LegendItem[] = [];

    // ── Date filter ───────────────────────────────────────────
    startDate: string = '';
    endDate: string = '';

    // ── Orders ────────────────────────────────────────────────
    orderSummary: any = null;
    ordersLoading = false;
    ordersError = '';
    orderCountLineRef: Chart | null = null;
    orderAmountLineRef: Chart | null = null;

    // ── Top Clients ───────────────────────────────────────────
    topClients: any = null;
    topClientsLoading = false;

    private readonly PALETTE = [
        '#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#a855f7',
        '#eab308', '#10b981', '#e11d48', '#3b82f6', '#84cc16'
    ];

    private readonly PROMO_COLORS = ['#22c55e', '#6366f1'];

    constructor(
        private shopStatService: ShopStatisticService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // 1. Initialize filters first
        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= currentYear - 4; y--) {
            this.availableYears.push(y);
        }

        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        this.endDate = this.formatDateInput(today);
        this.startDate = this.formatDateInput(thirtyDaysAgo);

        // 2. Then subscribe and load data
        this.authService.currentUser$.subscribe(u => {
            if (u?.shop_id) {
                this.shopId = u.shop_id;
                this.loadAllYearData();
                this.loadAllDateData();
            }
        });
    }

    ngAfterViewInit(): void {
        // Charts will be rendered once data arrives
    }

    ngOnDestroy(): void {
        this.productCountChart?.destroy();
        this.productAmountChartRef?.destroy();
        this.catCountChartRef?.destroy();
        this.catAmountChartRef?.destroy();
        this.promoCountChartRef?.destroy();
        this.promoAmountChartRef?.destroy();
        this.orderCountLineRef?.destroy();
        this.orderAmountLineRef?.destroy();
    }

    // ── Helpers ────────────────────────────────────────────────
    private formatDateInput(d: Date): string {
        return d.toISOString().split('T')[0];
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
    }

    formatNumber(value: number): string {
        return new Intl.NumberFormat('fr-FR').format(value);
    }

    getTrendClass(diff: number): string {
        return diff >= 0 ? 'positive' : 'negative';
    }

    getTrendLabel(diff: number): string {
        return (diff >= 0 ? '+' : '') + diff + '%';
    }

    // ── Year change ──────────────────────────────────────────
    onYearChange(): void {
        this.loadAllYearData();
    }

    onDateChange(): void {
        if (this.startDate && this.endDate) {
            this.loadAllDateData();
        }
    }

    public loadAllYearData(): void {
        if (!this.shopId) return;
        this.loadGlobalStats();
        this.loadProductStats();
        this.loadCategoryStats();
        this.loadPromoStats();
    }

    public loadAllDateData(): void {
        if (!this.shopId || !this.startDate || !this.endDate) return;
        this.loadOrderSummary();
        this.loadTopClients();
    }

    // ══════════════════════════════════════════════════════════
    // GLOBAL STATS
    // ══════════════════════════════════════════════════════════
    loadGlobalStats(): void {
        this.globalLoading = true;
        this.globalError = '';
        this.shopStatService.getGlobalStats(this.shopId, this.selectedYear).subscribe({
            next: (data) => {
                this.globalStats = data;
                this.globalLoading = false;
            },
            error: () => {
                this.globalError = 'Erreur lors du chargement des statistiques globales.';
                this.globalLoading = false;
            }
        });
    }

    // ══════════════════════════════════════════════════════════
    // PRODUCT STATS — Two bar charts
    // ══════════════════════════════════════════════════════════
    loadProductStats(): void {
        this.productsLoading = true;
        this.shopStatService.getProductStats(this.shopId, this.selectedYear).subscribe({
            next: (data) => {
                this.productsLoading = false;
                this.renderProductCharts(data);
            },
            error: () => { this.productsLoading = false; }
        });
    }

    private renderProductCharts(data: any[]): void {
        const labels = data.map(p => p.productName);
        const counts = data.map(p => p.orderCount);
        const amounts = data.map(p => p.totalAmount);
        const colors = labels.map((_, i) => this.PALETTE[i % this.PALETTE.length]);

        // Count chart
        this.productCountChart?.destroy();
        const ctx1 = this.productCountCanvas?.nativeElement;
        if (ctx1) {
            this.productCountChart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Nombre de commandes',
                        data: counts,
                        backgroundColor: colors.map(c => c + 'B3'),
                        borderColor: colors,
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                },
                options: this.barOptions('commande(s)')
            });
        }

        // Amount chart
        this.productAmountChartRef?.destroy();
        const ctx2 = this.productAmountCanvas?.nativeElement;
        if (ctx2) {
            this.productAmountChartRef = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Montant (MGA)',
                        data: amounts,
                        backgroundColor: 'rgba(245, 158, 11, 0.7)',
                        borderColor: 'rgba(245, 158, 11, 1)',
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                },
                options: this.barOptions(null, true)
            });
        }
    }

    private barOptions(unit: string | null, isCurrency = false): any {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => isCurrency
                            ? ` ${this.formatCurrency(ctx.parsed.y ?? 0)}`
                            : ` ${ctx.parsed.y} ${unit}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        ...(isCurrency ? {
                            callback: (value: any) => new Intl.NumberFormat('fr-MG', { notation: 'compact', style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value)
                        } : { stepSize: 1 })
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', maxRotation: 45, minRotation: 0 }
                }
            }
        };
    }

    // ══════════════════════════════════════════════════════════
    // CATEGORY STATS — Two doughnuts
    // ══════════════════════════════════════════════════════════
    loadCategoryStats(): void {
        this.categoriesLoading = true;
        this.shopStatService.getCategoryStats(this.shopId, this.selectedYear).subscribe({
            next: (data) => {
                this.categoriesLoading = false;
                this.renderCategoryDoughnuts(data);
            },
            error: () => { this.categoriesLoading = false; }
        });
    }

    private renderCategoryDoughnuts(data: any[]): void {
        const labels = data.map(c => c.categoryName);
        const counts = data.map(c => c.orderCount);
        const amounts = data.map(c => c.totalAmount);
        const colors = labels.map((_, i) => this.PALETTE[i % this.PALETTE.length]);

        // Count doughnut
        this.catCountChartRef?.destroy();
        const ctx1 = this.catCountCanvas?.nativeElement;
        if (ctx1) {
            this.catCountChartRef = this.createDoughnut(ctx1, labels, counts, colors);
        }
        this.catCountLegend = this.buildLegend(labels, counts, colors);

        // Amount doughnut
        this.catAmountChartRef?.destroy();
        const ctx2 = this.catAmountCanvas?.nativeElement;
        if (ctx2) {
            this.catAmountChartRef = this.createDoughnut(ctx2, labels, amounts, colors, true);
        }
        this.catAmountLegend = this.buildLegend(labels, amounts, colors);
        this.cdr.detectChanges();
    }

    // ══════════════════════════════════════════════════════════
    // PROMO STATS — Two doughnuts
    // ══════════════════════════════════════════════════════════
    loadPromoStats(): void {
        this.promosLoading = true;
        this.shopStatService.getPromoStats(this.shopId, this.selectedYear).subscribe({
            next: (data) => {
                this.promosLoading = false;
                this.renderPromoDoughnuts(data);
            },
            error: () => { this.promosLoading = false; }
        });
    }

    private renderPromoDoughnuts(data: any): void {
        const labels = ['Avec promo', 'Sans promo'];
        const counts = [data.withPromo.orderCount, data.withoutPromo.orderCount];
        const amounts = [data.withPromo.totalAmount, data.withoutPromo.totalAmount];

        this.promoCountChartRef?.destroy();
        const ctx1 = this.promoCountCanvas?.nativeElement;
        if (ctx1) {
            this.promoCountChartRef = this.createDoughnut(ctx1, labels, counts, this.PROMO_COLORS);
        }
        this.promoCountLegend = this.buildLegend(labels, counts, this.PROMO_COLORS);

        this.promoAmountChartRef?.destroy();
        const ctx2 = this.promoAmountCanvas?.nativeElement;
        if (ctx2) {
            this.promoAmountChartRef = this.createDoughnut(ctx2, labels, amounts, this.PROMO_COLORS, true);
        }
        this.promoAmountLegend = this.buildLegend(labels, amounts, this.PROMO_COLORS);
        this.cdr.detectChanges();
    }

    // ══════════════════════════════════════════════════════════
    // ORDER SUMMARY — Cards + Line charts
    // ══════════════════════════════════════════════════════════
    loadOrderSummary(): void {
        this.ordersLoading = true;
        this.ordersError = '';
        this.shopStatService.getOrderSummary(this.shopId, this.startDate, this.endDate).subscribe({
            next: (data) => {
                this.orderSummary = data;
                this.ordersLoading = false;
                this.renderOrderLineCharts(data.dailyStats);
            },
            error: () => {
                this.ordersError = 'Erreur lors du chargement des commandes.';
                this.ordersLoading = false;
            }
        });
    }

    private renderOrderLineCharts(dailyStats: any): void {
        const labels = Object.keys(dailyStats).sort();
        const counts = labels.map(d => dailyStats[d].count);
        const amounts = labels.map(d => dailyStats[d].amount);

        // Count line
        this.orderCountLineRef?.destroy();
        const ctx1 = this.orderCountLineCanvas?.nativeElement;
        if (ctx1) {
            this.orderCountLineRef = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Commandes payées',
                        data: counts,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#6366f1',
                        pointRadius: 3,
                    }]
                },
                options: this.lineOptions('commande(s)')
            });
        }

        // Amount line
        this.orderAmountLineRef?.destroy();
        const ctx2 = this.orderAmountLineCanvas?.nativeElement;
        if (ctx2) {
            this.orderAmountLineRef = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Montant (MGA)',
                        data: amounts,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#22c55e',
                        pointRadius: 3,
                    }]
                },
                options: this.lineOptions(null, true)
            });
        }
    }

    private lineOptions(unit: string | null, isCurrency = false): any {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => isCurrency
                            ? ` ${this.formatCurrency(ctx.parsed.y ?? 0)}`
                            : ` ${ctx.parsed.y} ${unit}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        ...(isCurrency ? {
                            callback: (value: any) => new Intl.NumberFormat('fr-MG', { notation: 'compact', style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value)
                        } : { stepSize: 1 })
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', maxTicksLimit: 15 }
                }
            }
        };
    }

    // ══════════════════════════════════════════════════════════
    // TOP CLIENTS
    // ══════════════════════════════════════════════════════════
    loadTopClients(): void {
        this.topClientsLoading = true;
        this.shopStatService.getTopClients(this.shopId, this.startDate, this.endDate).subscribe({
            next: (data) => {
                this.topClients = data;
                this.topClientsLoading = false;
            },
            error: () => { this.topClientsLoading = false; }
        });
    }

    // ══════════════════════════════════════════════════════════
    // SHARED CHART BUILDERS
    // ══════════════════════════════════════════════════════════
    private createDoughnut(ctx: HTMLCanvasElement, labels: string[], values: number[], colors: string[], isCurrency = false): Chart {
        const total = values.reduce((a, b) => a + b, 0);
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: 'transparent',
                    borderWidth: 0,
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx: any) => {
                                const val = ctx.parsed;
                                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                                return isCurrency
                                    ? ` ${ctx.label}: ${this.formatCurrency(val)} (${pct}%)`
                                    : ` ${ctx.label}: ${val} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    private buildLegend(labels: string[], values: number[], colors: string[]): LegendItem[] {
        const total = values.reduce((a, b) => a + b, 0);
        return labels.map((label, i) => ({
            label,
            value: values[i],
            percent: total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0',
            color: colors[i]
        }));
    }
}
